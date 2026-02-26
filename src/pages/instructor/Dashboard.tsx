import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Presentation, Plus, BookOpen, GraduationCap, Loader2, Trash2, ArrowRight, Sparkles } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Program {
  id: string;
  name: string;
  created_at: string;
}

interface Subject {
  id: string;
  name: string;
  subject_code: string;
  description: string | null;
  program_id: string | null;
  created_at: string;
}

export default function InstructorDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newProgramName, setNewProgramName] = useState("");
  const [subjectInputs, setSubjectInputs] = useState<Record<string, string>>({});
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [addingProgram, setAddingProgram] = useState(false);
  const [addingSubject, setAddingSubject] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadPrograms();
      loadSubjects();
    }
  }, [user]);

  const loadPrograms = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("programs" as any)
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setPrograms((data as any) || []);
    setLoading(false);
  };

  const loadSubjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subjects")
      .select("id, name, subject_code, description, program_id, created_at")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setSubjects((data as any) || []);
  };

  const generateSubjectCode = (subjectName: string): string => {
    const words = subjectName.trim().split(/\s+/);
    let code = "";
    if (words.length === 1) code = words[0].substring(0, 4).toUpperCase();
    else code = words.map(w => w[0]).join("").toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${code}${randomNum}`;
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newProgramName.trim()) return;
    setAddingProgram(true);
    const { error } = await supabase
      .from("programs" as any)
      .insert([{ name: newProgramName.trim(), instructor_id: user.id }] as any);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Program added", description: `${newProgramName} has been added.` });
      setNewProgramName("");
      loadPrograms();
    }
    setAddingProgram(false);
  };

  const handleAddSubject = async (e: React.FormEvent, programId: string) => {
    e.preventDefault();
    if (!user || !programId) return;
    const subjectName = subjectInputs[programId]?.trim();
    if (!subjectName) return;
    setAddingSubject(programId);
    const subjectCode = generateSubjectCode(subjectName);

    const { error } = await supabase
      .from("subjects")
      .insert({ name: subjectName, subject_code: subjectCode, instructor_id: user.id, program_id: programId });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Subject added", description: `${subjectName} (${subjectCode}) added.` });
      setSubjectInputs((prev) => { const next = { ...prev }; delete next[programId]; return next; });
      loadSubjects();
    }
    setAddingSubject(null);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!user) return;
    if (!confirm("Delete this program? Associated subjects will be unlinked.")) return;
    const { error } = await supabase.from("programs" as any).delete().eq("id", programId).eq("instructor_id", user.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Program has been removed." });
      loadPrograms();
      loadSubjects();
    }
  };

  const toggleProgram = (programId: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) newExpanded.delete(programId);
    else newExpanded.add(programId);
    setExpandedPrograms(newExpanded);
  };

  const getSubjectsForProgram = (programId: string) => subjects.filter((s) => s.program_id === programId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-instructor" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Sparkles className="h-5 w-5 text-instructor" />
          <span className="text-xs font-medium text-instructor uppercase tracking-wider">Dashboard</span>
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground">
          Program & Subject Management
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Create programs and organize your subjects.
        </p>
      </div>

      {/* Add Program Card */}
      <Card className="shadow-card border-instructor/15 gradient-instructor">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground font-display">
            <Plus className="h-5 w-5 text-instructor" />
            Add Program
          </CardTitle>
          <CardDescription>Create a new program (e.g., BSCS, BEED, BSED)</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProgram} className="flex gap-2">
            <Input
              placeholder="Enter program name (e.g., BSCS)"
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              className="flex-1 focus-visible:ring-instructor bg-card"
              required
            />
            <Button type="submit" disabled={addingProgram} className="bg-instructor text-instructor-foreground hover:bg-instructor/90 shadow-sm">
              {addingProgram ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" />Add</>}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Programs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-foreground">Programs</h2>
          <span className="text-xs text-muted-foreground">{programs.length} total</span>
        </div>

        {programs.length === 0 ? (
          <Card className="border-dashed border-2 border-border shadow-none">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-xl bg-muted p-4 mb-4">
                <GraduationCap className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No programs yet</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first program above to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => {
              const programSubjects = getSubjectsForProgram(program.id);
              const isExpanded = expandedPrograms.has(program.id);

              return (
                <Card key={program.id} className="shadow-card border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Collapsible open={isExpanded} onOpenChange={() => toggleProgram(program.id)}>
                        <CollapsibleTrigger className="flex items-center gap-2.5 hover:text-instructor transition-colors">
                          {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                          <div className="rounded-lg bg-instructor/10 p-1.5">
                            <GraduationCap className="h-4 w-4 text-instructor" />
                          </div>
                          <CardTitle className="text-base font-display">{program.name}</CardTitle>
                          <span className="text-xs text-muted-foreground ml-1 bg-muted px-2 py-0.5 rounded-full">
                            {programSubjects.length}
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4">
                          <form onSubmit={(e) => handleAddSubject(e, program.id)} className="flex gap-2 mb-4">
                            <Input
                              placeholder="Enter subject name"
                              value={subjectInputs[program.id] || ""}
                              onChange={(e) => setSubjectInputs((prev) => ({ ...prev, [program.id]: e.target.value }))}
                              className="flex-1 focus-visible:ring-instructor"
                              required
                            />
                            <Button type="submit" disabled={addingSubject === program.id} className="bg-instructor text-instructor-foreground hover:bg-instructor/90 shadow-sm">
                              {addingSubject === program.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="mr-2 h-4 w-4" />Add</>}
                            </Button>
                          </form>

                          {programSubjects.length === 0 ? (
                            <p className="text-xs text-muted-foreground py-4 text-center">No subjects yet. Add one above.</p>
                          ) : (
                            <div className="space-y-2">
                              {programSubjects.map((subject) => (
                                <div
                                  key={subject.id}
                                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border/50 bg-accent/30 cursor-pointer hover:bg-accent/60 hover:border-instructor/20 transition-all group"
                                  onClick={() => navigate(`/instructor/subject/${subject.id}`)}
                                >
                                  <div className="flex items-center gap-3">
                                    <BookOpen className="h-4 w-4 text-instructor" />
                                    <div>
                                      <span className="text-sm font-medium text-foreground">{subject.name}</span>
                                      <p className="text-[10px] text-muted-foreground font-mono">{subject.subject_code}</p>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-instructor group-hover:translate-x-0.5 transition-all" />
                                </div>
                              ))}
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteProgram(program.id)} className="text-muted-foreground hover:text-destructive hover:bg-destructive/8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
