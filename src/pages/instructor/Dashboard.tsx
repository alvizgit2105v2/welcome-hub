import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Presentation, Plus, BookOpen, GraduationCap, Loader2, Trash2 } from "lucide-react";
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
      .from("programs")
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading programs:", error);
    } else {
      setPrograms(data || []);
    }
    setLoading(false);
  };

  const loadSubjects = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .eq("instructor_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading subjects:", error);
    } else {
      setSubjects(data || []);
    }
  };

  const generateSubjectCode = (subjectName: string): string => {
    // Generate a unique subject code from the subject name
    const words = subjectName.trim().split(/\s+/);
    let code = "";
    
    if (words.length === 1) {
      code = words[0].substring(0, 4).toUpperCase();
    } else {
      code = words.map(w => w[0]).join("").toUpperCase();
    }
    
    // Add a random number to ensure uniqueness
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, "0");
    return `${code}${randomNum}`;
  };

  const handleAddProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newProgramName.trim()) return;

    setAddingProgram(true);
    const { data, error } = await supabase
      .from("programs")
      .insert({ name: newProgramName.trim(), instructor_id: user.id })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Program added",
        description: `${newProgramName} has been added successfully.`,
      });
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
    
    const { data, error } = await supabase
      .from("subjects")
      .insert({
        name: subjectName,
        subject_code: subjectCode,
        instructor_id: user.id,
        program_id: programId,
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Subject added",
        description: `${subjectName} (${subjectCode}) has been added successfully.`,
      });
      setSubjectInputs((prev) => {
        const next = { ...prev };
        delete next[programId];
        return next;
      });
      loadSubjects();
    }
    setAddingSubject(null);
  };

  const handleDeleteProgram = async (programId: string) => {
    if (!user) return;
    
    if (!confirm("Are you sure you want to delete this program? All associated subjects will be unlinked.")) {
      return;
    }

    const { error } = await supabase
      .from("programs")
      .delete()
      .eq("id", programId)
      .eq("instructor_id", user.id);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Program deleted",
        description: "Program has been deleted successfully.",
      });
      loadPrograms();
      loadSubjects();
    }
  };

  const toggleProgram = (programId: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programId)) {
      newExpanded.delete(programId);
    } else {
      newExpanded.add(programId);
    }
    setExpandedPrograms(newExpanded);
  };

  const getSubjectsForProgram = (programId: string) => {
    return subjects.filter((s) => s.program_id === programId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-instructor" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
          Program & Subject Management
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your programs and subjects. Create programs and add subjects to each program.
        </p>
      </div>

      {/* Add Program Card */}
      <Card className="border-instructor/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Plus className="h-5 w-5 text-instructor" />
            Add Program
          </CardTitle>
          <CardDescription>
            Create a new program (e.g., BSCS, BEED, BSED)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddProgram} className="flex gap-2">
            <Input
              placeholder="Enter program name (e.g., BSCS)"
              value={newProgramName}
              onChange={(e) => setNewProgramName(e.target.value)}
              className="flex-1 focus-visible:ring-instructor"
              required
            />
            <Button
              type="submit"
              disabled={addingProgram}
              className="bg-instructor text-instructor-foreground hover:bg-instructor/90"
            >
              {addingProgram ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Programs List */}
      <div className="space-y-4">
        <h2 className="font-display text-xl font-semibold text-foreground">
          Programs ({programs.length})
        </h2>

        {programs.length === 0 ? (
          <Card className="border-instructor/20">
            <CardContent className="py-8 text-center">
              <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No programs yet. Create your first program above.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {programs.map((program) => {
              const programSubjects = getSubjectsForProgram(program.id);
              const isExpanded = expandedPrograms.has(program.id);

              return (
                <Card key={program.id} className="border-instructor/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Collapsible
                        open={isExpanded}
                        onOpenChange={() => toggleProgram(program.id)}
                      >
                        <CollapsibleTrigger className="flex items-center gap-2 hover:text-instructor transition-colors">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <GraduationCap className="h-5 w-5 text-instructor" />
                          <CardTitle className="text-lg">{program.name}</CardTitle>
                          <span className="text-sm text-muted-foreground ml-2">
                            ({programSubjects.length} {programSubjects.length === 1 ? "subject" : "subjects"})
                          </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4">
                          {/* Add Subject Form */}
                          <form
                            onSubmit={(e) => handleAddSubject(e, program.id)}
                            className="flex gap-2 mb-4"
                          >
                            <Input
                              placeholder="Enter subject name"
                              value={subjectInputs[program.id] || ""}
                              onChange={(e) => {
                                setSubjectInputs((prev) => ({
                                  ...prev,
                                  [program.id]: e.target.value,
                                }));
                              }}
                              className="flex-1 focus-visible:ring-instructor"
                              required
                            />
                            <Button
                              type="submit"
                              disabled={addingSubject === program.id}
                              className="bg-instructor text-instructor-foreground hover:bg-instructor/90"
                            >
                              {addingSubject === program.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <>
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Subject
                                </>
                              )}
                            </Button>
                          </form>

                          {/* Subjects List */}
                          {programSubjects.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">
                              No subjects yet. Add a subject above.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {programSubjects.map((subject) => (
                                <Card
                                  key={subject.id}
                                  className="border-instructor/10 bg-instructor/5 cursor-pointer hover:border-instructor/30 hover:bg-instructor/10 transition-colors"
                                  onClick={() => navigate(`/instructor/subject/${subject.id}`)}
                                >
                                  <CardContent className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <BookOpen className="h-4 w-4 text-instructor" />
                                          <span className="font-medium">{subject.name}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          Code: {subject.subject_code}
                                        </p>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </CollapsibleContent>
                      </Collapsible>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProgram(program.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
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
