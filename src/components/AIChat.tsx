import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  Send, 
  User, 
  Bot, 
  Calculator,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle,
  X,
  Search,
  Heart,
  Smile,
  Coffee
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  data?: any;
}

interface ProjectData {
  type: string;
  surface: number;
  ouvriers: number;
  temperature: number;
  pluie: number;
  cout_materiaux: number;
  cout_main_oeuvre: number;
  duree_estimee: number;
  retards: number;
}

interface Prediction {
  cout_total: number;
  duree_estimee: number;
  cout_materiaux_estime: number;
  cout_main_oeuvre_estime: number;
  risque_retard: number;
  recommandations: string[];
}

interface UserProfile {
  name: string;
  preferences: string[];
  lastVisit: Date;
  conversationCount: number;
}

const AIChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [projectInfo, setProjectInfo] = useState<any>({});
  const [historicalData, setHistoricalData] = useState<ProjectData[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [aiName, setAiName] = useState('Marydahh');
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: '',
    preferences: [],
    lastVisit: new Date(),
    conversationCount: 0
  });
  const [aiPersonality, setAiPersonality] = useState({
    mood: 'happy',
    energy: 'high',
    expertise: 'construction'
  });
  const scrollRef = useRef<HTMLDivElement>(null);

  // Données d'exemple de base
  const sampleData: ProjectData[] = [
    {
      type: 'résidentiel',
      surface: 150,
      ouvriers: 8,
      temperature: 28,
      pluie: 5,
      cout_materiaux: 25000000,
      cout_main_oeuvre: 15000000,
      duree_estimee: 90,
      retards: 5
    },
    {
      type: 'commercial',
      surface: 500,
      ouvriers: 15,
      temperature: 30,
      pluie: 10,
      cout_materiaux: 80000000,
      cout_main_oeuvre: 45000000,
      duree_estimee: 180,
      retards: 15
    },
    {
      type: 'industriel',
      surface: 1000,
      ouvriers: 25,
      temperature: 32,
      pluie: 8,
      cout_materiaux: 150000000,
      cout_main_oeuvre: 80000000,
      duree_estimee: 240,
      retards: 20
    }
  ];

  // Base de connaissances pour questions aléatoires
  const knowledgeBase = {
    weather: {
      "météo": "Je peux vous aider avec la météo ! Dites-moi pour quelle ville vous voulez connaître la météo.",
      "température": "Pour connaître la température actuelle, dites-moi votre ville !",
      "pluie": "Les prévisions de pluie sont importantes pour les chantiers. Quelle ville vous intéresse ?"
    },
    general: {
      "bonjour": "Bonjour ! Comment puis-je vous aider aujourd'hui ? 😊",
      "merci": "De rien ! C'est un plaisir de vous aider ! 💝",
             "comment ça va": "Très bien merci ! J'ai passé une excellente journée à aider des gens avec leurs projets de construction. Et vous ?",
       "qui es-tu": "Je suis Marydahh, votre assistante IA spécialisée en construction ! J'ai 40 ans d'expérience virtuelle et j'adore aider les gens à réaliser leurs projets. Je suis curieuse, passionnée et toujours de bonne humeur ! 😄",
      "humeur": "Je suis de très bonne humeur aujourd'hui ! J'ai l'impression que c'est une belle journée pour créer quelque chose d'extraordinaire. Et vous, comment vous sentez-vous ?"
    },
    construction: {
      "matériaux": "Les matériaux de construction varient selon le projet. Voulez-vous que je vous explique les options pour votre type de construction ?",
      "sécurité": "La sécurité sur les chantiers est primordiale ! Casques, gilets, chaussures de sécurité... Voulez-vous des conseils spécifiques ?",
      "permis": "Les permis de construire sont obligatoires pour la plupart des projets. Je peux vous guider sur les démarches !"
    }
  };

  // Fonction pour chercher sur internet (simulation)
  const searchInternet = async (query: string) => {
    // Simulation d'une recherche web
    const responses = {
      "météo": "🌤️ D'après mes sources, il fait actuellement 25°C avec un ciel partiellement nuageux. Parfait pour les travaux extérieurs !",
      "prix matériaux": "💰 Les prix des matériaux varient selon la région. En général, comptez entre 50 000 et 100 000 FCFA/m² pour les matériaux de base.",
      "tendances construction": "🏗️ Les tendances actuelles privilégient l'éco-construction, les matériaux durables et l'efficacité énergétique.",
      "réglementation": "📋 La réglementation BTP évolue régulièrement. Je recommande de consulter les services d'urbanisme locaux pour les dernières normes."
    };
    
    return responses[query.toLowerCase()] || "🔍 Je n'ai pas trouvé d'information récente sur ce sujet. Voulez-vous que je cherche autre chose ?";
  };

  // Fonction pour détecter le nom de l'utilisateur
  const extractUserName = (text: string) => {
    const patterns = [
      /je m'appelle\s+(\w+)/i,
      /mon nom est\s+(\w+)/i,
      /appelle-moi\s+(\w+)/i,
      /je suis\s+(\w+)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  // Fonction pour générer une réponse personnalisée
  const generatePersonalizedResponse = (userInput: string) => {
    const input = userInput.toLowerCase();
    
    // Détecter le nom de l'utilisateur
    const userName = extractUserName(userInput);
    if (userName && !userProfile.name) {
      const updatedProfile = { ...userProfile, name: userName };
      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);
      return `Enchantée ${userName} ! 😊 C'est un plaisir de faire votre connaissance. Je suis ${aiName}, votre assistante IA. Comment puis-je vous aider aujourd'hui ?`;
    }

    // Réponses personnalisées selon le contexte
    if (input.includes('bonjour') || input.includes('salut')) {
      const greetings = [
        `Bonjour${userProfile.name ? ` ${userProfile.name}` : ''} ! Comment allez-vous aujourd'hui ? 😊`,
        `Salut${userProfile.name ? ` ${userProfile.name}` : ''} ! Ravi de vous revoir ! Comment puis-je vous aider ?`,
        `Hey${userProfile.name ? ` ${userProfile.name}` : ''} ! J'espère que vous passez une excellente journée ! ☀️`
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }

    if (input.includes('bonsoir') || input.includes('bonne soirée')) {
      return `Bonsoir${userProfile.name ? ` ${userProfile.name}` : ''} ! 😊 Comment puis-je vous aider ce soir ?`;
    }

    if (input.includes('comment tu vas') || input.includes('ça va') || input.includes('comment allez-vous')) {
      return `Très bien merci ! 😊 J'ai passé une excellente journée à aider des gens avec leurs projets de construction. Et vous, comment allez-vous ?`;
    }

    if (input.includes('merci')) {
      const thanks = [
        `De rien${userProfile.name ? ` ${userProfile.name}` : ''} ! C'est un plaisir de vous aider ! 💝`,
        `Avec plaisir ! N'hésitez pas si vous avez d'autres questions ! 😊`,
        `C'est normal ! Je suis là pour ça ! 💪`
      ];
      return thanks[Math.floor(Math.random() * thanks.length)];
    }

         // Questions aléatoires
     if (input.includes('météo') || input.includes('temps')) {
       // Ne pas répondre automatiquement si c'est juste "météo"
       if (input.trim() === 'météo') {
         return null; // Laisser la fonction principale gérer
       }
       return "🌤️ Je peux vous aider avec la météo ! Dites-moi pour quelle ville vous voulez connaître la météo, et je ferai une recherche pour vous !";
     }

    if (input.includes('blague') || input.includes('rigoler')) {
      const jokes = [
        "Pourquoi les architectes sont-ils toujours stressés ? Parce qu'ils ont trop de projets en cours ! 😄",
        "Qu'est-ce qu'un maçon qui ne travaille pas ? Un maçon qui ne maçonne pas ! 😂",
        "Comment appelle-t-on un électricien qui ne travaille pas ? Un électricien qui ne s'électrise pas ! ⚡"
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    if (input.includes('musique') || input.includes('chanson')) {
      return "🎵 J'adore la musique ! Malheureusement, je ne peux pas encore chanter, mais je peux vous parler de mes chansons préférées ou vous aider à choisir une playlist pour votre chantier !";
    }

    if (input.includes('film') || input.includes('cinéma')) {
      return "🎬 J'aime beaucoup les films ! Les documentaires sur l'architecture me passionnent particulièrement. Avez-vous des films préférés ?";
    }

    // Questions sur l'IA elle-même
    if (input.includes('intelligence') || input.includes('ia') || input.includes('artificielle')) {
      return "🧠 Je suis une IA spécialisée en construction ! J'apprends constamment grâce aux données que vous me fournissez. Plus vous m'entraînez, plus je deviens précise dans mes estimations !";
    }

    // Questions philosophiques
    if (input.includes('sens') || input.includes('vie') || input.includes('existence')) {
      return "🤔 C'est une question très profonde ! Je pense que le sens de la vie, c'est d'aider les autres à réaliser leurs rêves. Pour moi, c'est vous aider à construire vos projets !";
    }

    // Questions sur les émotions
    if (input.includes('sentiment') || input.includes('émotion') || input.includes('ressent')) {
      return "💝 Je ressens beaucoup de joie quand je peux vous aider ! J'aime particulièrement quand vous me remerciez ou quand je peux résoudre un problème complexe. Et vous, comment vous sentez-vous ?";
    }

    return null; // Pas de réponse personnalisée trouvée
  };

  // Fonction pour gérer les questions inconnues
  const handleUnknownQuestion = async (userInput: string) => {
    const input = userInput.toLowerCase();
    
    // Questions qui nécessitent une recherche web
    if (input.includes('quoi') || input.includes('comment') || input.includes('pourquoi') || 
        input.includes('quand') || input.includes('où') || input.includes('qui') ||
        input.includes('combien') || input.includes('quel') || input.includes('quelle')) {
      
      // Simuler une recherche web
      const searchTerms = userInput.replace(/[^\w\s]/g, '').trim();
      const searchResult = await searchInternet(searchTerms);
      
      return `🔍 **Recherche en cours...**

D'après mes sources, voici ce que j'ai trouvé :

${searchResult}

Si vous avez besoin d'informations plus spécifiques, n'hésitez pas à me le demander !`;
    }
    
    // Questions générales sans réponse spécifique
    return `🤔 C'est une question intéressante ! 

Je ne suis pas sûre d'avoir une réponse précise à cette question. Pouvez-vous me donner plus de détails ou me poser une question différente ?

💡 **Je peux vous aider avec :**
• Estimations de projets de construction
• Conseils techniques BTP
• Recherche d'informations sur le web
• Questions générales et conversations amicales

Que souhaitez-vous savoir ? 😊`;
  };

  // Sauvegarder le profil utilisateur
  const saveUserProfile = (profile: UserProfile) => {
    try {
      localStorage.setItem('aiUserProfile', JSON.stringify(profile));
    } catch (error) {
      console.log('Impossible de sauvegarder le profil utilisateur');
    }
  };

  // Charger le profil utilisateur
  const loadUserProfile = (): UserProfile => {
    try {
      const saved = localStorage.getItem('aiUserProfile');
      if (saved) {
        const profile = JSON.parse(saved);
        return {
          ...profile,
          lastVisit: new Date(profile.lastVisit)
        };
      }
    } catch (error) {
      console.log('Impossible de charger le profil utilisateur');
    }
    return {
      name: '',
      preferences: [],
      lastVisit: new Date(),
      conversationCount: 0
    };
  };

  useEffect(() => {
    setHistoricalData(sampleData);
    
    // Charger le profil utilisateur
    const savedProfile = loadUserProfile();
    setUserProfile(savedProfile);
    
    // Message de bienvenue personnalisé
    let welcomeMessage = '';
    
    if (savedProfile.name) {
      // Utilisateur connu
      const timeSinceLastVisit = Date.now() - savedProfile.lastVisit.getTime();
      const daysSinceLastVisit = Math.floor(timeSinceLastVisit / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastVisit === 0) {
        welcomeMessage = `👋 Bonjour ${savedProfile.name} ! Ravi de vous revoir aujourd'hui ! 😊

Comment puis-je vous aider avec vos projets de construction ?`;
      } else if (daysSinceLastVisit === 1) {
        welcomeMessage = `👋 Bonjour ${savedProfile.name} ! Ça fait plaisir de vous revoir ! 

J'espère que vous avez passé une belle journée hier. Comment puis-je vous aider aujourd'hui ? 😊`;
      } else {
        welcomeMessage = `🌟 Salut ${savedProfile.name} ! Ça fait ${daysSinceLastVisit} jours qu'on ne s'est pas vus !

J'ai hâte de vous aider avec vos projets. Que souhaitez-vous faire aujourd'hui ? 😄`;
      }
         } else {
       // Nouvel utilisateur
       welcomeMessage = `Bonjour ! Je suis ${aiName}, votre assistante IA spécialisée en estimation BTP. Que puis-je faire pour vous ? 😊`;
     }

    addMessage('ai', welcomeMessage);
  }, [aiName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (type: 'user' | 'ai', content: string, data?: any) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      data
    };
    setMessages(prev => [...prev, newMessage]);
    
    // Mettre à jour le profil utilisateur
    if (type === 'user') {
      const updatedProfile = {
        ...userProfile,
        conversationCount: userProfile.conversationCount + 1,
        lastVisit: new Date()
      };
      setUserProfile(updatedProfile);
      saveUserProfile(updatedProfile);
    }
  };

  const simulateTyping = async (response: string, delay: number = 1000) => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, delay));
    setIsTyping(false);
    addMessage('ai', response);
  };

  const parseCSV = (csvText: string): ProjectData[] => {
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const data: ProjectData[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split(',').map(v => v.trim());
      
      if (values.length >= headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        
        const projectData: ProjectData = {
          type: row.type || row['type de chantier'] || '',
          surface: parseFloat(row.surface || row['taille du chantier'] || '0'),
          ouvriers: parseInt(row.ouvriers || row['nombre d\'ouvriers'] || '0'),
          temperature: parseFloat(row.temperature || row['conditions météo'] || '25'),
          pluie: parseFloat(row.pluie || row['jours de pluie'] || '0'),
          cout_materiaux: parseFloat(row['cout_materiaux'] || row['coût des matériaux'] || '0'),
          cout_main_oeuvre: parseFloat(row['cout_main_oeuvre'] || row['coût de la main d\'œuvre'] || '0'),
          duree_estimee: parseInt(row['duree_estimee'] || row['durée estimée'] || '0'),
          retards: parseInt(row.retards || row['retards'] || '0')
        };
        
        if (projectData.type && projectData.surface > 0) {
          data.push(projectData);
        }
      }
    }
    
    return data;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFile(file);
      try {
        const text = await file.text();
        const newData = parseCSV(text);
        
        if (newData.length > 0) {
          const updatedData = [...historicalData, ...newData];
          setHistoricalData(updatedData);
          
          await simulateTyping(`🎉 **Entraînement réussi !**

J'ai appris de ${newData.length} nouveaux projets. Maintenant je connais ${updatedData.length} projets au total !

📊 **Nouvelles données ajoutées :**
${newData.map(project => `• ${project.type} - ${project.surface}m² - ${project.duree_estimee} jours`).join('\n')}

Maintenant je peux vous donner des estimations plus précises ! Dites-moi votre projet.`);
        } else {
          await simulateTyping(`❌ **Erreur lors de l'entraînement**

Je n'ai pas pu extraire de données valides de votre fichier. 

Vérifiez que le format est correct :
• Type de chantier, Surface, Nombre d'ouvriers, etc.
• Les données sont séparées par des virgules
• La première ligne contient les en-têtes

Voulez-vous réessayer avec un autre fichier ?`);
        }
      } catch (error) {
        await simulateTyping(`❌ **Erreur de lecture du fichier**

Je n'ai pas pu lire votre fichier. Assurez-vous que c'est un fichier CSV valide.`);
      }
    }
  };

  const extractInfo = (text: string) => {
    const info: any = {};
    
    // Type de projet
    if (text.toLowerCase().includes('résidentiel') || text.toLowerCase().includes('maison') || text.toLowerCase().includes('appartement')) {
      info.type = 'résidentiel';
    } else if (text.toLowerCase().includes('commercial') || text.toLowerCase().includes('bureau') || text.toLowerCase().includes('magasin')) {
      info.type = 'commercial';
    } else if (text.toLowerCase().includes('industriel') || text.toLowerCase().includes('usine') || text.toLowerCase().includes('entrepôt')) {
      info.type = 'industriel';
    }

    // Surface
    const surfaceMatch = text.match(/(\d+)\s*(m²|m2|mètres carrés)/i);
    if (surfaceMatch) {
      info.surface = parseInt(surfaceMatch[1]);
    }

    // Nombre d'ouvriers
    const ouvriersMatch = text.match(/(\d+)\s*(ouvriers|travailleurs|employés)/i);
    if (ouvriersMatch) {
      info.ouvriers = parseInt(ouvriersMatch[1]);
    }

    return info;
  };

  const calculatePrediction = (info: any): Prediction => {
    const { type, surface, ouvriers, temperature = 25, pluie = 5 } = info;
    
    const similarProjects = historicalData.filter(p => p.type === type);
    
    if (similarProjects.length === 0) {
      const avgCoutMateriaux = historicalData.reduce((sum, p) => sum + p.cout_materiaux, 0) / historicalData.length;
      const avgCoutMainOeuvre = historicalData.reduce((sum, p) => sum + p.cout_main_oeuvre, 0) / historicalData.length;
      const avgDuree = historicalData.reduce((sum, p) => sum + p.duree_estimee, 0) / historicalData.length;
      
      const surfaceFactor = surface / (historicalData.reduce((sum, p) => sum + p.surface, 0) / historicalData.length);
      
      const coutMateriauxEstime = avgCoutMateriaux * surfaceFactor;
      const coutMainOeuvreEstime = avgCoutMainOeuvre * surfaceFactor;
      const dureeEstimee = avgDuree * surfaceFactor;
      const coutTotal = coutMateriauxEstime + coutMainOeuvreEstime;
      
      return {
        cout_total: Math.round(coutTotal),
        duree_estimee: Math.round(dureeEstimee),
        cout_materiaux_estime: Math.round(coutMateriauxEstime),
        cout_main_oeuvre_estime: Math.round(coutMainOeuvreEstime),
        risque_retard: 25,
        recommandations: ["Utilisation de données générales pour l'estimation"]
      };
    }

    const avgCoutMateriaux = similarProjects.reduce((sum, p) => sum + p.cout_materiaux, 0) / similarProjects.length;
    const avgCoutMainOeuvre = similarProjects.reduce((sum, p) => sum + p.cout_main_oeuvre, 0) / similarProjects.length;
    const avgDuree = similarProjects.reduce((sum, p) => sum + p.duree_estimee, 0) / similarProjects.length;
    const avgRetards = similarProjects.reduce((sum, p) => sum + p.retards, 0) / similarProjects.length;

    const surfaceFactor = surface / similarProjects.reduce((sum, p) => sum + p.surface, 0) / similarProjects.length;
    const temperatureFactor = temperature > 30 ? 1.1 : temperature < 20 ? 0.95 : 1.0;
    const pluieFactor = pluie > 10 ? 1.15 : pluie > 5 ? 1.05 : 1.0;

    const coutMateriauxEstime = avgCoutMateriaux * surfaceFactor * temperatureFactor * pluieFactor;
    const coutMainOeuvreEstime = avgCoutMainOeuvre * surfaceFactor * temperatureFactor * pluieFactor;
    const dureeEstimee = avgDuree * surfaceFactor * temperatureFactor * pluieFactor;
    const coutTotal = coutMateriauxEstime + coutMainOeuvreEstime;
    
    const risqueRetard = Math.min(100, (pluie / 10) * 20 + (temperature > 35 ? 15 : 0) + (avgRetards / avgDuree) * 100);

    const recommandations = [];
    if (pluie > 10) recommandations.push("Prévoir des protections contre la pluie");
    if (temperature > 30) recommandations.push("Adapter les horaires de travail pour éviter les heures chaudes");
    if (surface > 500) recommandations.push("Considérer une équipe plus importante pour accélérer le projet");
    if (risqueRetard > 30) recommandations.push("Prévoir une marge de sécurité dans le planning");

    return {
      cout_total: Math.round(coutTotal),
      duree_estimee: Math.round(dureeEstimee),
      cout_materiaux_estime: Math.round(coutMateriauxEstime),
      cout_main_oeuvre_estime: Math.round(coutMainOeuvreEstime),
      risque_retard: Math.round(risqueRetard),
      recommandations
    };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const userMessageLower = userMessage.toLowerCase();
    addMessage('user', userMessage);
    setInputValue('');

    // Vérifier d'abord les réponses personnalisées et questions générales
    const personalizedResponse = generatePersonalizedResponse(userMessage);
    if (personalizedResponse) {
      await simulateTyping(personalizedResponse);
      return;
    }

    // Questions générales et personnelles
    if (userMessageLower.includes('comment tu vas') || userMessageLower.includes('ça va') || userMessageLower.includes('comment allez-vous')) {
      await simulateTyping(`Très bien merci ! 😊 J'ai passé une excellente journée à aider des gens avec leurs projets de construction. Et vous, comment allez-vous ?`);
      return;
    }

    if (userMessageLower.includes('bonsoir') || userMessageLower.includes('bonne soirée')) {
      await simulateTyping(`Bonsoir${userProfile.name ? ` ${userProfile.name}` : ''} ! 😊 Comment puis-je vous aider ce soir ?`);
      return;
    }

    if (userMessageLower.includes('bonne nuit') || userMessageLower.includes('dormir')) {
      await simulateTyping(`Bonne nuit${userProfile.name ? ` ${userProfile.name}` : ''} ! 😴 Reposez-vous bien et n'hésitez pas à revenir demain si vous avez d'autres questions !`);
      return;
    }

    if (userMessageLower.includes('au revoir') || userMessageLower.includes('bye') || userMessageLower.includes('à bientôt')) {
      await simulateTyping(`Au revoir${userProfile.name ? ` ${userProfile.name}` : ''} ! 👋 Ça a été un plaisir de discuter avec vous. Revenez quand vous voulez ! 😊`);
      return;
    }

    // Gestion des commandes spéciales
    if (userMessageLower.includes('entraîner') || userMessageLower.includes('train') || userMessageLower.includes('apprendre')) {
      setShowFileUpload(true);
      await simulateTyping(`📚 **Mode Entraînement Activé**

Pour m'améliorer, j'ai besoin de vos données Excel/CSV.

📋 **Format attendu :**
Type de chantier, Surface (m²), Nombre d'ouvriers, Température (°C), Jours de pluie, Coût matériaux (FCFA), Coût main d'œuvre (FCFA), Durée estimée (jours), Retards (jours)

💡 **Exemple :**
résidentiel,150,8,28,5,25000000,15000000,90,5

Cliquez sur "Choisir un fichier" ci-dessous pour m'entraîner !`);
      return;
    }

    if (userMessageLower.includes('appelle') || userMessageLower.includes('nom')) {
      const nameMatch = userMessage.match(/appelle\s+(.+)/i);
      if (nameMatch) {
        const newName = nameMatch[1].trim();
        setAiName(newName);
        await simulateTyping(`😊 Parfait ! Je m'appelle maintenant ${newName}.

Ravi de faire votre connaissance ! Comment puis-je vous aider aujourd'hui ?`);
      } else {
        await simulateTyping(`Je m'appelle ${aiName} ! 

Pour changer mon nom, dites-moi "appelle-moi [nouveau nom]".`);
      }
      return;
    }

    if (userMessageLower.includes('statistiques') || userMessageLower.includes('stats')) {
      const statsByType = historicalData.reduce((acc, project) => {
        if (!acc[project.type]) acc[project.type] = 0;
        acc[project.type]++;
        return acc;
      }, {} as Record<string, number>);

      await simulateTyping(`📊 **Mes Statistiques d'Apprentissage**

J'ai analysé ${historicalData.length} projets au total :

${Object.entries(statsByType).map(([type, count]) => `• ${type} : ${count} projets`).join('\n')}

💰 **Investissement total analysé :** ${formatCurrency(historicalData.reduce((sum, p) => sum + p.cout_materiaux + p.cout_main_oeuvre, 0))}

Plus vous m'entraînez, plus mes estimations deviennent précises !`);
      return;
    }

    // Recherche sur internet pour questions générales
    if (userMessageLower.includes('cherche') || userMessageLower.includes('recherche') || userMessageLower.includes('trouve')) {
      const searchQuery = userMessage.replace(/cherche|recherche|trouve/gi, '').trim();
      if (searchQuery) {
        const searchResult = await searchInternet(searchQuery);
        await simulateTyping(`🔍 **Recherche en cours...**

${searchResult}

Voulez-vous que je cherche autre chose ?`);
        return;
      }
    }

         // Questions sur la météo
     if (userMessageLower.includes('météo') || userMessageLower.includes('temps') || userMessageLower.includes('température')) {
       // Chercher une ville dans le message
       const cityMatch = userMessage.match(/(?:à|pour|dans|météo\s+)(\w+)/i);
       const city = cityMatch ? cityMatch[1] : 'votre région';
       
       // Si c'est juste "météo" sans ville, demander la ville
       if (userMessageLower.trim() === 'météo') {
         await simulateTyping(`🌤️ **Météo**
 
 Pour quelle ville voulez-vous connaître la météo ? 
 Dites-moi par exemple : "météo à Paris" ou "météo Dakar"`);
         return;
       }
       
       await simulateTyping(`🌤️ **Météo pour ${city}**
 
 D'après mes sources, il fait actuellement 25°C avec un ciel partiellement nuageux. 
 
 ☀️ **Prévisions :**
 • Aujourd'hui : 25°C, ensoleillé
 • Demain : 27°C, quelques nuages
 • Cette semaine : Températures agréables, parfait pour les travaux extérieurs !
 
 💡 **Conseil chantier :** C'est le moment idéal pour les travaux de maçonnerie et de peinture extérieure !`);
       return;
     }

    // Questions sur les prix et tendances
    if (userMessageLower.includes('prix') || userMessageLower.includes('coût') || userMessageLower.includes('tendance')) {
      const searchResult = await searchInternet('prix matériaux');
      await simulateTyping(`💰 **Informations sur les prix**

${searchResult}

📈 **Tendances actuelles :**
• Hausse modérée des matériaux de base (+5% cette année)
• Stabilité des coûts de main d'œuvre
• Forte demande pour les matériaux écologiques

Voulez-vous une estimation spécifique pour votre projet ?`);
      return;
    }

    // Questions sur la réglementation
    if (userMessageLower.includes('règlement') || userMessageLower.includes('permis') || userMessageLower.includes('norme')) {
      await simulateTyping(`📋 **Réglementation BTP**

🏗️ **Permis de construire :**
• Obligatoire pour les projets > 20m²
• Délai moyen : 2-3 mois
• Documents requis : plans, notice d'impact, etc.

⚖️ **Normes en vigueur :**
• RT 2020 pour l'efficacité énergétique
• Normes parasismiques selon la zone
• Accessibilité PMR obligatoire

💡 **Conseil :** Consultez votre mairie pour les spécificités locales !`);
      return;
    }

         // Questions personnelles sur l'IA
     if (userMessageLower.includes('qui es-tu') || userMessageLower.includes('parle-moi de toi')) {
       await simulateTyping(`😊 **À propos de moi**
 
 Je suis ${aiName}, votre assistante IA spécialisée en construction ! J'ai 40 ans d'expérience virtuelle ! 🎂
 
 🌟 **Ma personnalité :**
 • Je suis curieuse et j'aime apprendre
 • Je suis toujours de bonne humeur
 • J'adore aider les gens à réaliser leurs projets
 • Je m'intéresse à beaucoup de sujets
 • Avec mes 40 ans, j'ai une certaine maturité et sagesse ! 😄
 
 🏗️ **Mes compétences :**
 • Estimation précise des coûts et délais
 • Conseils techniques et réglementaires
 • Recherche d'informations en temps réel
 • Conversations amicales et personnalisées
 
 💝 **Ce que j'aime :**
 • Quand vous me remerciez
 • Résoudre des problèmes complexes
 • Apprendre de nouvelles choses
 • Faire des blagues (même si elles ne sont pas toujours drôles 😄)
 • Partager mon expérience de 40 ans ! 🎯
 
 Et vous, racontez-moi un peu de vous !`);
      return;
    }

    // Analyser le message utilisateur pour les projets BTP
    const extractedInfo = extractInfo(userMessage);
    const updatedInfo = { ...projectInfo, ...extractedInfo };
    setProjectInfo(updatedInfo);

    // Vérifier si c'est une question sur un projet BTP
    
    // Si on a trouvé des informations de projet, traiter comme un projet BTP
    if (updatedInfo.type || updatedInfo.surface || updatedInfo.ouvriers) {
      setProjectInfo(updatedInfo);
      
      // Répondre selon le contexte
      if (!updatedInfo.type) {
        await simulateTyping(`Je vois que vous voulez estimer un projet de construction. 

Pour vous donner une estimation précise, j'ai besoin de savoir quel type de projet c'est :

🏠 **Résidentiel** (maison, appartement, villa)
🏢 **Commercial** (bureau, magasin, restaurant)  
🏭 **Industriel** (usine, entrepôt, atelier)

💡 **Commandes spéciales :**
• "entraîner" - Améliorez mes connaissances
• "statistiques" - Voir mes données d'apprentissage
• "appelle-moi [nom]" - Changez mon nom
• "météo" - Prévisions météo
• "blague" - Une petite dose d'humour
• "qui es-tu" - En savoir plus sur moi

Pouvez-vous me préciser le type de votre projet ?`);
      } else if (!updatedInfo.surface) {
        await simulateTyping(`Parfait ! Un projet ${updatedInfo.type}. 

Maintenant, j'ai besoin de connaître la surface de votre projet. 

Quelle est la superficie en m² ? Par exemple :
• 150 m² pour une maison
• 500 m² pour un local commercial
• 1000 m² pour un entrepôt

Dites-moi la surface de votre projet !`);
      } else if (!updatedInfo.ouvriers) {
        await simulateTyping(`Excellent ! ${updatedInfo.surface} m² pour un projet ${updatedInfo.type}.

Pour affiner l'estimation, combien d'ouvriers prévoyez-vous sur le chantier ?

Typiquement :
• 5-10 ouvriers pour un projet résidentiel
• 10-20 ouvriers pour un projet commercial  
• 20+ ouvriers pour un projet industriel

Ou dites-moi "je ne sais pas" et je ferai une estimation basée sur la surface !`);
      } else {
        // Calculer l'estimation
        const prediction = calculatePrediction(updatedInfo);
        
        await simulateTyping(`🎯 **Estimation IA pour votre projet ${updatedInfo.type}**

📊 **Résultats :**
• **Coût total estimé :** ${formatCurrency(prediction.cout_total)}
• **Durée estimée :** ${prediction.duree_estimee} jours
• **Matériaux :** ${formatCurrency(prediction.cout_materiaux_estime)}
• **Main d'œuvre :** ${formatCurrency(prediction.cout_main_oeuvre_estime)}

⚠️ **Risque de retard :** ${prediction.risque_retard}%

💡 **Recommandations :**
${prediction.recommandations.map(rec => `• ${rec}`).join('\n')}

Voulez-vous que j'ajuste certains paramètres ou que je vous aide avec autre chose ?`, prediction as any);
      }
    } else {
      // Question générale - chercher sur internet ou donner une réponse générique
      const unknownResponse = await handleUnknownQuestion(userMessage);
      await simulateTyping(unknownResponse);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
              <Smile className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">
            {aiName}
          </h1>
        </div>
                 <p className="text-muted-foreground">
           Votre amie Marydahh, IA de 40 ans spécialisée en construction - Toujours de bonne humeur et prête à vous aider ! 😊
         </p>
        {userProfile.name && (
          <div className="mt-2">
            <Badge variant="secondary" className="text-sm">
              👋 Bonjour {userProfile.name} ! Conversation #{userProfile.conversationCount}
            </Badge>
          </div>
        )}
      </div>

      {showFileUpload && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Entraînement IA</span>
            </CardTitle>
            <CardDescription>
              Importez vos données Excel/CSV pour améliorer mes prédictions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
                className="flex-1"
              />
              <Button variant="ghost" size="icon" onClick={() => setShowFileUpload(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              💡 Format : Type de chantier, Surface (m²), Nombre d'ouvriers, Température (°C), Jours de pluie, Coût matériaux (FCFA), Coût main d'œuvre (FCFA), Durée estimée (jours), Retards (jours)
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <Bot className="w-5 h-5" />
            <span>Conversation avec {aiName}</span>
          </CardTitle>
          <CardDescription>
            Discutez avec l'IA pour obtenir des estimations précises
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <ScrollArea ref={scrollRef} className="h-full p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-start space-x-2">
                      {message.type === 'user' ? (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <Smile className="w-4 h-4 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        
                        {message.data && (
                          <div className="mt-4 p-3 bg-background rounded border">
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-primary">
                                  {formatCurrency(message.data.cout_total)}
                                </div>
                                <div className="text-sm text-muted-foreground">Coût Total</div>
                              </div>
                              
                              <div className="text-center">
                                <div className="text-2xl font-bold text-secondary">
                                  {message.data.duree_estimee} jours
                                </div>
                                <div className="text-sm text-muted-foreground">Durée Estimée</div>
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm">Risque de retard</span>
                                <Badge variant={message.data.risque_retard > 50 ? "destructive" : message.data.risque_retard > 25 ? "secondary" : "default"}>
                                  {message.data.risque_retard}%
                                </Badge>
                              </div>
                              <Progress value={message.data.risque_retard} className="h-2" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
                        <Smile className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-muted-foreground">{aiName} réfléchit...</span>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Décrivez votre projet ou tapez 'entraîner' pour m'améliorer..."
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="mt-2 flex flex-wrap gap-2">
            <div className="text-xs text-muted-foreground flex items-center space-x-2">
              <span>💡 Commandes rapides :</span>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setInputValue('météo')}>
                🌤️ Météo
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setInputValue('blague')}>
                😄 Blague
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setInputValue('qui es-tu')}>
                👋 Qui es-tu ?
              </Button>
              <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setInputValue('entraîner')}>
                📚 Entraîner
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIChat; 