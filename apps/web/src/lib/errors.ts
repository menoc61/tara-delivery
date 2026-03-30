import toast from "react-hot-toast";

/**
 * User-friendly French error messages for common API errors
 */
const errorMessages: Record<string, string> = {
  // Auth errors
  "Invalid credentials": "Email ou mot de passe incorrect",
  "Identifiants invalides": "Email ou mot de passe incorrect",
  "User not found": "Aucun compte trouvé avec cet email",
  "Email already exists": "Un compte existe déjà avec cet email",
  "Email already registered": "Un compte existe déjà avec cet email",
  "Password too weak": "Le mot de passe doit contenir au moins 8 caractères",
  "Too many auth attempts":
    "Trop de tentatives. Veuillez réessayer dans quelques minutes.",
  "Too many requests": "Trop de requêtes. Veuillez patienter un instant.",
  "Invalid token": "Session expirée. Veuillez vous reconnecter.",
  "Token expired": "Session expirée. Veuillez vous reconnecter.",
  Unauthorized: "Veuillez vous connecter pour continuer",
  Forbidden: "Vous n'avez pas accès à cette ressource",

  // Order errors
  "Order not found": "Commande introuvable",
  "Invalid order status": "Statut de commande invalide",
  "Cannot cancel order": "Impossible d'annuler cette commande",

  // Payment errors
  "Payment failed": "Le paiement a échoué. Veuillez réessayer.",
  "Invalid phone number": "Numéro de téléphone invalide",

  // Network errors
  "Network Error": "Erreur de connexion. Vérifiez votre réseau.",
  "timeout exceeded": "La requête a pris trop de temps. Réessayez.",

  // Generic errors
  "Internal server error": "Une erreur est survenue. Réessayez plus tard.",
  "Bad request": "Requête invalide",
  "Not found": "Ressource introuvable",
};

/**
 * Extract a user-friendly error message from an error object
 */
export function getErrorMessage(error: unknown): string {
  // Check for Axios error structure
  if (error && typeof error === "object") {
    const err = error as Record<string, unknown>;

    // Axios error with response
    if (err.response && typeof err.response === "object") {
      const response = err.response as Record<string, unknown>;
      const data = response.data as Record<string, unknown> | undefined;

      // Check for API error message
      if (data?.message && typeof data.message === "string") {
        return errorMessages[data.message] || data.message;
      }
      if (data?.error && typeof data.error === "string") {
        return errorMessages[data.error] || data.error;
      }
    }

    // Network error
    if (err.message && typeof err.message === "string") {
      if (err.message.includes("Network Error")) {
        return "Erreur de connexion. Vérifiez votre connexion internet.";
      }
      if (err.message.includes("timeout")) {
        return "La requête a pris trop de temps. Réessayez.";
      }
      return errorMessages[err.message] || err.message;
    }
  }

  // String error
  if (typeof error === "string") {
    return errorMessages[error] || error;
  }

  return "Une erreur inattendue s'est produite. Réessayez.";
}

/**
 * Show a user-friendly error toast
 */
export function showErrorToast(error: unknown): void {
  const message = getErrorMessage(error);
  toast.error(message);
}

/**
 * Show a success toast
 */
export function showSuccessToast(message: string): void {
  toast.success(message);
}
