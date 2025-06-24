import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-background to-secondary/20">
      <main className="max-w-5xl w-full space-y-12 text-center">
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            Flueo
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Master Spanish naturally with AI-powered spaced repetition flashcards
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/login">
            <Button size="lg" variant="default" className="cursor-pointer w-full sm:w-auto min-w-[150px]">
              Login
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="lg" variant="outline" className="cursor-pointer qw-full sm:w-auto min-w-[150px]">
              Sign Up Free
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered</CardTitle>
              <CardDescription>Smart learning algorithms adapt to your progress</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Spaced Repetition</CardTitle>
              <CardDescription>Learn efficiently with proven memory techniques</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Natural Context</CardTitle>
              <CardDescription>Learn phrases in real-world situations</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
