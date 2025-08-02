import { supabase } from '@/integrations/supabase/client';

export interface UserProfile {
  id: string;
  user_id: string;
  role: 'client' | 'fournisseur' | 'chef_chantier';
  first_name?: string;
  last_name?: string;
  company_name?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChatActor {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: string;
  company?: string;
  phone?: string;
  email?: string;
  location?: string;
  userId: string;
}

export class UserService {
  /**
   * Récupère tous les utilisateurs de la base de données
   */
  static async getAllUsers(): Promise<ChatActor[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        return [];
      }

      // Transformer les profils en acteurs de chat
      const actors: ChatActor[] = profiles.map((profile: UserProfile) => ({
        id: profile.user_id,
        userId: profile.user_id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
        role: this.getRoleLabel(profile.role),
        avatar: profile.avatar_url,
        company: profile.company_name,
        phone: profile.phone,
        location: profile.city ? `${profile.city}, ${profile.postal_code || ''}`.trim() : undefined,
        isOnline: false, // Par défaut, on ne peut pas savoir si l'utilisateur est en ligne
        lastSeen: 'Il y a quelques minutes'
      }));

      return actors;
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      return [];
    }
  }

  /**
   * Récupère un utilisateur par son ID
   */
  static async getUserById(userId: string): Promise<ChatActor | null> {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !profile) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
        return null;
      }

      return {
        id: profile.user_id,
        userId: profile.user_id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
        role: this.getRoleLabel(profile.role),
        avatar: profile.avatar_url,
        company: profile.company_name,
        phone: profile.phone,
        location: profile.city ? `${profile.city}, ${profile.postal_code || ''}`.trim() : undefined,
        isOnline: false,
        lastSeen: 'Il y a quelques minutes'
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  }

  /**
   * Récupère l'utilisateur actuellement connecté
   */
  static async getCurrentUser(): Promise<ChatActor | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return null;
      }

      return await this.getUserById(user.id);
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur actuel:', error);
      return null;
    }
  }

  /**
   * Recherche des utilisateurs par nom, rôle ou entreprise
   */
  static async searchUsers(query: string): Promise<ChatActor[]> {
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,company_name.ilike.%${query}%`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la recherche d\'utilisateurs:', error);
        return [];
      }

      return profiles.map((profile: UserProfile) => ({
        id: profile.user_id,
        userId: profile.user_id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Utilisateur',
        role: this.getRoleLabel(profile.role),
        avatar: profile.avatar_url,
        company: profile.company_name,
        phone: profile.phone,
        location: profile.city ? `${profile.city}, ${profile.postal_code || ''}`.trim() : undefined,
        isOnline: false,
        lastSeen: 'Il y a quelques minutes'
      }));
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
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
   * Vérifie si un utilisateur est en ligne (simulation)
   */
  static isUserOnline(userId: string): boolean {
    // Pour l'instant, on simule. Plus tard, on pourra utiliser des WebSockets
    // ou une table de présence pour déterminer qui est en ligne
    return Math.random() > 0.5; // 50% de chance d'être en ligne
  }

  /**
   * Met à jour le statut de présence d'un utilisateur
   */
  static async updateUserPresence(userId: string, isOnline: boolean): Promise<void> {
    try {
      // Ici, on pourrait mettre à jour une table de présence
      // Pour l'instant, on ne fait rien
      console.log(`Utilisateur ${userId} ${isOnline ? 'en ligne' : 'hors ligne'}`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la présence:', error);
    }
  }
} 