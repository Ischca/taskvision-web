import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../components/AuthProvider";

export default function useRequireAuth(redirectUrl: string = "/login") {
  const auth = useAuth();
  const { userId, loading: authLoading } = auth;
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  const isAuthenticated =
    userId !== null && userId !== undefined && userId !== "";

  useEffect(() => {
    if (authLoading) return;

    if (!authChecked) {
      setAuthChecked(true);
      return;
    }

    if (!isAuthenticated && authChecked) {
      router.push(redirectUrl);
    }
  }, [authLoading, userId, isAuthenticated, router, redirectUrl, authChecked]);

  return { ...auth, isAuthenticated };
}
