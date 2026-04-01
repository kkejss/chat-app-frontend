import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router";

import { LoginSchema } from "@/components/schema/login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { loginUser } from "@/services/auth.service";

// Faqja e hyrjes - validon me Zod, therret loginUser dhe ridrejton te /chat
export default function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  // Konfiguron formularin me validim Zod dhe vlera fillestare boshe
  const form = useForm({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Nis kerkesen e login-it; nese deshtoi shfaq gabimin nga backend-i
  async function onSubmit(values) {
    setServerError(null);
    try {
      await loginUser(values);
      navigate("/chat");
    } catch (error) {
      const message =
        error?.data?.message ||
        "Invalid username or password.";
      setServerError(message);
    }
  }

  return (
    <section className="flex min-h-screen w-full justify-center items-center"
      style={{ background: "var(--bg-primary)" }}>

      {/* Efekte dekorative te sfondit */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(26,74,138,0.2) 0%, transparent 70%)" }} />
      <div className="fixed bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(212,160,23,0.07) 0%, transparent 70%)" }} />

      <div className="w-full max-w-md px-4 fade-in">
        {/* Titulli i aplikacionit */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold tracking-wide"
            style={{ background: "linear-gradient(135deg, #d4a017, #f5dcaa, #d4a017)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Lumiere
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
            where conversations bloom
          </p>
        </div>

        <Card className="relative overflow-hidden card-shimmer"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-subtle)",
            boxShadow: "0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(212,160,23,0.08)"
          }}>
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          {/* Formulari i login-it me fushat username dhe password */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="password" placeholder="Password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Shfaq gabimin nga serveri nese ka */}
                {serverError && (
                  <p className="text-sm" style={{ color: "#f87171" }}>{serverError}</p>
                )}
              </CardContent>

              <CardFooter className="flex justify-between items-center">
                <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  Don't have an account?{" "}
                  <Link to="/signup"
                    style={{ color: "var(--gold)", textDecoration: "underline", textUnderlineOffset: "3px" }}>
                    Sign up
                  </Link>
                </p>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Signing in..." : "Sign in →"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </section>
  );
}