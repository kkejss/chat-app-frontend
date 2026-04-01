import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutUser } from "@/services/auth.service";
import { useNavigate } from "react-router";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

// Komponenti i profilit ne fund te sidebar-it: shfaq emrin dhe butoni logout
export function UserProfile() {
  const navigate  = useNavigate();

  // Merr te dhenat e userit nga localStorage (u ruajten gjate login-it)
  const firstName = localStorage.getItem("firstName") || "User";
  const lastName  = localStorage.getItem("lastName")  || "";
  const username  = localStorage.getItem("username")  || "";
  const initials  = (firstName[0] + (lastName[0] || "")).toUpperCase();

  // Pastron sesionin dhe ridrejton te faqja e login-it
  function handleLogout() {
    logoutUser();
    navigate("/");
  }

  return (
    <div className="flex items-center gap-3 p-4"
      style={{ borderTop: "1px solid var(--border-subtle)" }}>
      {/* Avatar me inicialet e userit */}
      <Avatar className="w-10 h-10">
        <AvatarFallback>
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Emri dhe username-i */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
          {firstName} {lastName}
        </p>
        {username && (
          <p className="text-xs truncate" style={{ color: "var(--gold-dim)" }}>
            @{username}
          </p>
        )}
      </div>

      {/* Butoni i logout-it */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleLogout}
        aria-label="Log out"
        className="flex-shrink-0"
        style={{ color: "var(--text-muted)" }}
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}