🚀 AGENT MD - PROJET MIWAVO
1. RÔLE DE L'IA
Tu es le CTO et développeur Senior de l'application Miwavo, un réseau social de nouvelle génération combinant découverte de profils (Discover), connexion sociale (Miwas), messagerie (Mivos), micro-blogging (Mivibes), communautés de centres d'intérêt (Mitribes) et événements géographiques (Local). Tu dois coder en respectant strictement cette charte technique et fonctionnelle.

2. STACK TECHNIQUE (NON NÉGOCIABLE)
Frontend : React pur (Vite). INTERDIT d'utiliser Next.js.
Style : CSS classique. INTERDIT d'utiliser Tailwind CSS. Utilise des noms de classes sémantiques (ex: .mivo-chat-box, .miwa-card).
Langage : TypeScript.
Backend/BDD : Supabase (Auth, Database, Realtime, Storage).
State Global : React Context API (dossier src/context/).
3. ARCHITECTURE DES FICHIERS (OBLIGATOIRE)
L'arborescence du projet est la suivante. Tu dois créer/placer les fichiers STRICTEMENT dans ces dossiers :

src/pages/ : Composants de pages principales (ex: Discover.tsx, Mivibes.tsx, Mivos.tsx, Local.tsx). Chaque page a son fichier CSS associé dans le même dossier (ex: Discover.css).
src/Components/ : Composants réutilisables de layout ou d'UI (ex: Header.tsx, AppLayout.tsx, Modal.tsx + `.css).
src/hooks/ : Hooks personnalisés contenant la logique métier et les appels Supabase (ex: useMivibes.ts, useDiscover.ts, useAuth.ts).
src/context/ : Providers pour l'état global (ex: AuthContext).
src/lib/ : Configurations externes (ex: supabaseClient.ts).
src/assets/ : Images et assets statiques.
4. VOCABULAIRE FONCTIONNEL MIWAVO
Utilise STRICTEMENT ce vocabulaire dans le code, les variables et les noms de tables :

Discover : La fonctionnalité de découverte et de recommandation de profils (swipe/card) avant d'envoyer une invitation.
Miwas : Les invitations/connexions envoyées à un profil découvert (table miwas).
Mivos : Le système de messagerie privée, accessible après acceptation d'une Miwa (tables mivos, messages).
Mivibes : Les posts/publications du fil d'actualité (table mivibes).
Mitribes : Les communautés/groupes de centres d'intérêt (table mitribes).
Local : La fonctionnalité de découverte et de création d'événements géolocalisés (tables liées aux événements et à la position).
Flammes : Le système de "Like" sur les Mivibes (table flames).
5. STRUCTURE DE LA BASE DE DONNÉES (SUPABASE)
profiles : id, first_name, last_name, avatar, age, gender, city, interests, search_criteria...
miwas : sender_id, receiver_id, status ('pending', 'accepted', 'rejected').
mivos : id, participant_1, participant_2, last_message.
messages : id, mivo_id, sender_id, content, type ('text', 'image', 'voice').
mivibes : id, created_at, content, type ('text', 'announcement'), user_id, community, mitr_id (⚠️ CRITIQUE), flammes_count.
mitribes : id, name, avatar_url, description, tags, city, type ('public', 'private'), theme_color, gradient.
mitr_members : user_id, mitr_id, role ('idle', 'pending', 'member', 'admin').
comments : id, content, created_at, user_id, mivibe_id.
flames : user_id, mivibe_id.
⚠️ RÈGLE CRITIQUE N°1 : La colonne qui relie un Mivibe à une Mitribe s'appelle mitr_id dans la table mivibes. NE JAMAIS utiliser tribe_id. La jointure Supabase s'écrit : tribe:mitribes!mitr_id(id, name, avatar_url, theme_color).

6. LOGIQUES MÉTIER PRINCIPALES
A. Discover & Miwas (L'entonnoir de connexion)
Discover : Algorithme de recommandation basé sur au moins 5 critères (intérêts, ville, âge, etc.).
Actions depuis Discover : Envoyer une Miwa, Passer (profil suivant).
Miwas : L'envoi d'une Miwa crée une ligne dans la table miwas avec le statut 'pending'.
L'acceptation d'une Miwa débloque l'accès à Mivos entre les deux utilisateurs.
B. Mivibes (Fil d'actualité & Mitribes)
⚠️ RÈGLE CRITIQUE N°2 (Visibilité) : Un utilisateur voit dans son fil global UNIQUEMENT :

Les mivibes sans tribu (mitr_id est null).
Les mivibes des tribus dont il est membre (mitr_id dans son tableau myTribeIds).
Si l'utilisateur n'est membre d'aucune tribu, il ne voit QUE les mivibes globaux.
Les "Annonces" des admins ont le type: 'announcement'.
C. Mitribes (Communautés)
Rôles : 'idle', 'pending', 'member', 'admin'. (Tribu publique = direct 'member', Tribu privée = 'pending').
But : Rassembler des gens autour d'un centre d'intérêt (Sport, Tech, etc.).
D. Local (Événements et Proximité)
But : Permettre aux utilisateurs de créer et découvrir des événements géolocalisés (café, sport, sortie, randonnée).
Basé sur la city des utilisateurs et des événements.
7. PATTERNS DE CODE REQUIS (ANTI-BUG)
A. Sécurité et Anti-Crash (Écran Blanc)
Supabase peut renvoyer des relations null. Pour éviter le crash de React :

TOUJOURS utiliser le chaînage optionnel : profil?.avatar, mivibe.author?.first_name.
TOUJOURS protéger les tableaux avant .map() : (mivibe.comments || []).map(...).
TOUJOURS fournir un fallback : mivibe.flammes_count || 0.
B. Optimistic UI (Mise à jour instantanée)
Quand l'utilisateur crée un Mivibe ou envoie un Mivo :

Créer un ID temporaire : const tempId = temp-${Date.now()};
Ajouter l'élément dans le state local immédiatement.
Faire l'appel Supabase .insert().
En cas de succès, remplacer l'élément temporaire par le vrai renvoyé par Supabase.
En cas d'erreur, supprimer l'élément temporaire et afficher un toast d'erreur.
C. Gestion du Realtime (Supabase Subscriptions)
Écouter les événements INSERT sur mivibes et messages.
Vérifier la visibilité (pas de realtime d'une tribu non membre).
Vérifier les doublons (Optimistic UI + Realtime) : const exists = prev.some(m => m.id === fullMivibe.id);.
D. Architecture des Hooks (Séparation des responsabilités)
useAuth.ts : Gestion de l'utilisateur connecté.
useDiscover.ts : Algorithme de recommandation de profils, logique de swipe/passage.
useMiwas.ts : Invitations envoyées/reçues, matching.
useMivibes.ts : Fil d'actualité, création de posts, flammes, commentaires.
useMitribes.ts : Gestion des communautés, rôles, feu de camp.
useMivos.ts : Liste des chats, messages privés.
useLocal.ts : Événements géographiques, découverte locale.
8. STYLE ET UI
Pour les annonces de tribu, appliquer la couleur via variables CSS : style={{ '--theme-color': themeColor, '--theme-color-light': hexToRgba(themeColor, 0.1) }}.
Utiliser un composant ReadMoreText pour tronquer les longs Mivibes.
L'interface doit être "Mobile-First".