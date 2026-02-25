"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { auth } from "../../../src/lib/firebase";
import { updateProfile, deleteUser, signOut } from "firebase/auth";
import { useAuth } from "../../../src/app/components/AuthProvider";
import Link from "next/link";
import { useTranslations } from "../LocaleLayoutClient";

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "ja";
  const t = useTranslations();
  const { user, userId, loading } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    if (!loading && !userId) {
      router.push(`/${locale}/login`);
    }
  }, [loading, userId, router, locale]);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      await updateProfile(user, { displayName });
      setSuccessMessage(t("profile.updateSuccess"));
    } catch (error: unknown) {
      console.error("Profile update error:", error);
      setErrorMessage(t("profile.updateError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmText = t("profile.deleteConfirmWord");

  const handleDeleteAccount = async () => {
    if (!user) return;

    if (deleteConfirmText !== confirmText) {
      setErrorMessage(t("profile.confirmMismatch"));
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      await deleteUser(user);
      router.push(`/${locale}/login`);
    } catch (error: unknown) {
      console.error("Account deletion error:", error);
      setErrorMessage(t("profile.deleteError"));
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push(`/${locale}/login`);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">{t("common.states.loading")}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("profile.title")}
        </h1>
        <Link
          href={`/${locale}`}
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
        >
          {`← ${t("common.backToHome")}`}
        </Link>
      </div>

      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700 dark:text-red-400">
            {errorMessage}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-sm text-green-700 dark:text-green-400">
            {successMessage}
          </p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              className={`px-4 py-4 text-sm font-medium ${activeTab === "profile" ? "text-blue-600 border-b-2 border-blue-500" : "text-gray-600 dark:text-gray-300 hover:text-gray-800"}`}
              onClick={() => setActiveTab("profile")}
            >
              {t("profile.tabs.profile")}
            </button>
            <button
              className={`px-4 py-4 text-sm font-medium ${activeTab === "account" ? "text-blue-600 border-b-2 border-blue-500" : "text-gray-600 dark:text-gray-300 hover:text-gray-800"}`}
              onClick={() => setActiveTab("account")}
            >
              {t("profile.tabs.account")}
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile}>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("profile.name")}
                  </label>
                  <div className="mt-1">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {t("profile.email")}
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
                      value={email}
                      disabled
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t("profile.emailHint")}
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? t("profile.updating")
                      : t("profile.updateButton")}
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t("profile.accountActions")}
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <button
                    type="button"
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    onClick={handleLogout}
                  >
                    {t("common.actions.logout")}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-red-600">
                  {t("profile.dangerZone")}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {t("profile.deleteWarning")}
                </p>

                {!showDeleteConfirm ? (
                  <button
                    type="button"
                    className="mt-4 px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    {t("profile.deleteAccount")}
                  </button>
                ) : (
                  <div className="mt-4 p-4 border border-red-300 rounded-md bg-red-50 dark:bg-red-900/20">
                    <h4 className="text-md font-medium text-red-800 dark:text-red-400">
                      {t("profile.deleteConfirmTitle")}
                    </h4>
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {t("profile.deleteConfirmMessage")}
                    </p>
                    <div className="mt-3">
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={deleteConfirmText}
                        onChange={(e) => setDeleteConfirmText(e.target.value)}
                        placeholder={confirmText}
                      />
                    </div>
                    <div className="mt-3 flex space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                        disabled={
                          isSubmitting || deleteConfirmText !== confirmText
                        }
                        onClick={handleDeleteAccount}
                      >
                        {isSubmitting
                          ? t("profile.processing")
                          : t("profile.deleteAccountPermanent")}
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteConfirmText("");
                        }}
                      >
                        {t("common.actions.cancel")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
