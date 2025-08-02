import { supabase } from '@/integrations/supabase/client';
import { ChatActor } from './userService';

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  conversation_id: string;
  type: 'text' | 'file' | 'image';
  file_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  title: string;
  is_group: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  joined_at: string;
}

export interface ConversationWithParticipants extends Conversation {
  participants: ChatActor[];
  lastMessage?: Message;
  unreadCount: number;
}

export class ChatService {
  /**
   * Récupère toutes les conversations de l'utilisateur connecté
   */
  static async getUserConversations(userId: string): Promise<ConversationWithParticipants[]> {
    try {
      // Récupérer les conversations où l'utilisateur participe
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          conversations (
            id,
            title,
            is_group,
            created_by,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', userId);

      if (participantsError) {
        console.error('Erreur lors de la récupération des conversations:', participantsError);
        return [];
      }

      // Pour chaque conversation, récupérer les participants et le dernier message
      const conversationsWithDetails: ConversationWithParticipants[] = [];

      for (const participant of participants) {
        const conversation = participant.conversations;
        
        // Récupérer tous les participants de cette conversation
        const { data: allParticipants, error: participantsError } = await supabase
          .from('conversation_participants')
          .select('user_id')
          .eq('conversation_id', conversation.id);

        if (participantsError) {
          console.error('Erreur lors de la récupération des participants:', participantsError);
          continue;
        }

        // Récupérer les détails des participants
        const participantDetails: ChatActor[] = [];
        for (const participantData of allParticipants) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', participantData.user_id)
            .single();

          if (profile) {
            participantDetails.push({
              id: profile.user_id,
              userId: profile.user_id,
              name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
              role: this.getRoleLabel(profile.role),
              avatar: profile.avatar_url,
              company: profile.company_name,
              phone: profile.phone,
              isOnline: false,
              lastSeen: 'Il y a quelques minutes'
            });
          }
        }

        // Récupérer le dernier message
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversation.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        conversationsWithDetails.push({
          ...conversation,
          participants: participantDetails,
          lastMessage: lastMessage || undefined,
          unreadCount: 0 // À implémenter avec une table de lecture
        });
      }

      return conversationsWithDetails;
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      return [];
    }
  }

  /**
   * Récupère les messages d'une conversation
   */
  static async getConversationMessages(conversationId: string): Promise<Message[]> {
    try {
      const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des messages:', error);
        return [];
      }

      return messages || [];
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      return [];
    }
  }

  /**
   * Envoie un message dans une conversation
   */
  static async sendMessage(conversationId: string, senderId: string, content: string, type: 'text' | 'file' | 'image' = 'text', fileUrl?: string): Promise<Message | null> {
    try {
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: senderId,
          content,
          type,
          file_url: fileUrl
        })
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de l\'envoi du message:', error);
        return null;
      }

      return message;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle conversation
   */
  static async createConversation(title: string, isGroup: boolean, createdBy: string, participantIds: string[]): Promise<Conversation | null> {
    try {
      console.log('🔧 ChatService.createConversation appelé avec:', { title, isGroup, createdBy, participantIds });
      
      // Créer la conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          title,
          is_group: isGroup,
          created_by: createdBy
        })
        .select()
        .single();

      if (conversationError) {
        console.error('❌ Erreur lors de la création de la conversation:', conversationError);
        return null;
      }

      console.log('✅ Conversation créée:', conversation);

      // Ajouter les participants (incluant le créateur)
      const allParticipantIds = [...new Set([createdBy, ...participantIds])];
      const participants = allParticipantIds.map(userId => ({
        conversation_id: conversation.id,
        user_id: userId
      }));

      console.log('📋 Participants à ajouter:', participants);

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (participantsError) {
        console.error('❌ Erreur lors de l\'ajout des participants:', participantsError);
        return null;
      }

      console.log('✅ Participants ajoutés avec succès');
      return conversation;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la conversation:', error);
      return null;
    }
  }

  /**
   * Ajoute un participant à une conversation
   */
  static async addParticipantToConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          user_id: userId
        });

      if (error) {
        console.error('Erreur lors de l\'ajout du participant:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du participant:', error);
      return false;
    }
  }

  /**
   * Supprime un participant d'une conversation
   */
  static async removeParticipantFromConversation(conversationId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', userId);

      if (error) {
        console.error('Erreur lors de la suppression du participant:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression du participant:', error);
      return false;
    }
  }

  /**
   * Convertit le rôle de la base de données en label français
   */
  private static getRoleLabel(role: string): string {
    switch (role) {
      case 'client':
        return 'Maître d\'ouvrage';
      case 'fournisseur':
        return 'Fournisseur';
      case 'chef_chantier':
        return 'Chef de chantier';
      default:
        return role;
    }
  }

  /**
   * Écoute les nouveaux messages en temps réel
   */
  static subscribeToMessages(conversationId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          callback(payload.new as Message);
        }
      )
      .subscribe();
  }

  /**
   * Se désabonne des messages
   */
  static unsubscribeFromMessages(conversationId: string) {
    supabase.channel(`messages:${conversationId}`).unsubscribe();
  }
} 