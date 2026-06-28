/// <reference types="vite/client" />

// ✅ Permet à TypeScript d'accepter les imports CSS sans erreur
declare module '*.css' {
  const content: string;
  export default content;
}