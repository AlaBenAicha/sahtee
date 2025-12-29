/**
 * Mobile Investigation Component
 *
 * Mobile-optimized investigation mode with camera/voice input capabilities.
 * Designed for field investigation and on-site incident documentation.
 */

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Mic,
  MicOff,
  Send,
  Plus,
  Image as ImageIcon,
  FileText,
  MapPin,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  AlertTriangle,
  Pause,
  Play,
  RotateCcw,
  Upload,
  Loader2,
  Volume2,
  VolumeX,
  Eye,
  Download,
  Share2,
  Menu,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import {
  getInvestigationService,
  type InvestigationSession,
  type EvidenceItem,
  type WitnessStatement,
  type InvestigationPhase,
} from "@/services/ai/investigationService";
import { useAuth } from "@/contexts/AuthContext";

// =============================================================================
// Types
// =============================================================================

interface MobileInvestigationProps {
  incidentId: string;
  incidentReference: string;
  onClose?: () => void;
  onComplete?: (sessionId: string) => void;
}

interface CapturedMedia {
  id: string;
  type: "photo" | "video" | "audio";
  dataUrl: string;
  timestamp: Date;
  description?: string;
  location?: GeolocationPosition | null;
}

interface VoiceNote {
  id: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  transcription?: string;
  isTranscribing: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const PHASE_LABELS: Record<InvestigationPhase, string> = {
  initial_review: "Revue initiale",
  evidence_collection: "Collecte des preuves",
  witness_statements: "Témoignages",
  root_cause_analysis: "Analyse des causes",
  capa_generation: "Génération CAPA",
  report_drafting: "Rédaction rapport",
  review_approval: "Revue finale",
};

const PHASE_ICONS: Record<InvestigationPhase, React.ReactNode> = {
  initial_review: <Eye className="h-4 w-4" />,
  evidence_collection: <Camera className="h-4 w-4" />,
  witness_statements: <User className="h-4 w-4" />,
  root_cause_analysis: <AlertTriangle className="h-4 w-4" />,
  capa_generation: <FileText className="h-4 w-4" />,
  report_drafting: <FileText className="h-4 w-4" />,
  review_approval: <Check className="h-4 w-4" />,
};

// =============================================================================
// Component
// =============================================================================

export function MobileInvestigation({
  incidentId,
  incidentReference,
  onClose,
  onComplete,
}: MobileInvestigationProps) {
  const { session: authSession } = useAuth();
  const [session, setSession] = useState<InvestigationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [showCamera, setShowCamera] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [capturedMedia, setCapturedMedia] = useState<CapturedMedia[]>([]);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<CapturedMedia | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    autoTranscribe: true,
    locationTracking: true,
    offlineMode: false,
    soundEffects: true,
  });

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize investigation session
  useEffect(() => {
    const initSession = async () => {
      if (!authSession?.organizationId) return;

      setIsLoading(true);
      try {
        const investigationService = getInvestigationService();
        investigationService.initialize({
          organizationId: authSession.organizationId,
          userId: authSession.uid,
          userRole: authSession.role || "user",
          userName: authSession.displayName || "User",
          language: "fr",
          permissions: [],
        });

        const newSession = await investigationService.startInvestigation(incidentId);
        setSession(newSession);
      } catch (error) {
        console.error("Failed to start investigation:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, [incidentId, authSession]);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages]);

  // Camera handlers
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setShowCamera(false);
  };

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

    // Get location if enabled
    let location: GeolocationPosition | null = null;
    if (settings.locationTracking && navigator.geolocation) {
      try {
        location = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 5000,
          });
        });
      } catch {
        console.warn("Could not get location");
      }
    }

    const media: CapturedMedia = {
      id: `photo-${Date.now()}`,
      type: "photo",
      dataUrl,
      timestamp: new Date(),
      location,
    };

    setCapturedMedia((prev) => [...prev, media]);
    stopCamera();

    if (settings.soundEffects) {
      // Play shutter sound
      const audio = new Audio("/sounds/camera-shutter.mp3");
      audio.play().catch(() => {});
    }
  }, [settings.locationTracking, settings.soundEffects]);

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const voiceNote: VoiceNote = {
          id: `voice-${Date.now()}`,
          blob,
          duration: recordingDuration,
          timestamp: new Date(),
          isTranscribing: settings.autoTranscribe,
        };

        setVoiceNotes((prev) => [...prev, voiceNote]);

        // Transcribe if enabled
        if (settings.autoTranscribe) {
          // In a real implementation, this would call a speech-to-text API
          setTimeout(() => {
            setVoiceNotes((prev) =>
              prev.map((vn) =>
                vn.id === voiceNote.id
                  ? {
                      ...vn,
                      isTranscribing: false,
                      transcription: "Transcription automatique (à implémenter avec API STT)",
                    }
                  : vn
              )
            );
          }, 2000);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  // Message handlers
  const handleSendMessage = async () => {
    if (!message.trim() || !session) return;

    setIsSending(true);
    try {
      const investigationService = getInvestigationService();
      const result = await investigationService.sendMessage(session.id, message);
      setSession(result.session);
      setMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Phase navigation
  const handleGoToPhase = async (phase: InvestigationPhase) => {
    if (!session) return;

    setIsLoading(true);
    try {
      const investigationService = getInvestigationService();
      const result = await investigationService.goToPhase(session.id, phase);
      setSession(result.session);
    } catch (error) {
      console.error("Failed to change phase:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate report
  const handleGenerateReport = async () => {
    if (!session) return;

    setIsLoading(true);
    try {
      const investigationService = getInvestigationService();
      const report = await investigationService.generateReport(session.id, "detailed", "fr");
      onComplete?.(session.id);
    } catch (error) {
      console.error("Failed to generate report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading && !session) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Démarrage de l'investigation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 px-4 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-semibold text-sm">Investigation Mobile</h1>
              <p className="text-xs text-muted-foreground">{incidentReference}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {session && PHASE_LABELS[session.currentPhase]}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Investigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowSettings(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleGenerateReport}>
                  <FileText className="h-4 w-4 mr-2" />
                  Générer rapport
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Aide
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Phase progress */}
        <div className="mt-3">
          <Progress
            value={
              session
                ? ((Object.keys(PHASE_LABELS).indexOf(session.currentPhase) + 1) /
                    Object.keys(PHASE_LABELS).length) *
                  100
                : 0
            }
            className="h-1"
          />
        </div>
      </header>

      {/* Main content */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col overflow-hidden"
      >
        <TabsList className="flex-shrink-0 mx-4 mt-2 grid grid-cols-4">
          <TabsTrigger value="chat" className="text-xs">
            <Send className="h-4 w-4 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="media" className="text-xs">
            <Camera className="h-4 w-4 mr-1" />
            Media
            {capturedMedia.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                {capturedMedia.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">
            <Mic className="h-4 w-4 mr-1" />
            Audio
            {voiceNotes.length > 0 && (
              <Badge variant="secondary" className="ml-1 h-4 w-4 p-0 text-[10px] flex items-center justify-center">
                {voiceNotes.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="phases" className="text-xs">
            <ChevronRight className="h-4 w-4 mr-1" />
            Phases
          </TabsTrigger>
        </TabsList>

        {/* Chat Tab */}
        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden m-0 mt-2">
          <ScrollArea ref={scrollRef} className="flex-1 px-4">
            <div className="space-y-4 py-4">
              {session?.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-4 py-2",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-muted rounded-bl-none"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p
                      className={cn(
                        "text-[10px] mt-1",
                        msg.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                      )}
                    >
                      {msg.timestamp.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {msg.suggestedActions.map((action, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-xs cursor-pointer hover:bg-secondary/80"
                          >
                            {action.label}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Message input */}
          <div className="flex-shrink-0 p-4 border-t bg-background">
            <div className="flex gap-2">
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-10 w-10" onClick={startCamera}>
                  <Camera className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("h-10 w-10", isRecording && "text-red-500 animate-pulse")}
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez votre observation..."
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                size="icon"
                className="h-10 w-10"
                onClick={handleSendMessage}
                disabled={!message.trim() || isSending}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="flex-1 overflow-hidden m-0 mt-2">
          <ScrollArea className="h-full px-4">
            <div className="py-4">
              {/* Quick capture button */}
              <Button
                variant="outline"
                className="w-full mb-4 h-20 flex flex-col gap-2"
                onClick={startCamera}
              >
                <Camera className="h-8 w-8" />
                <span>Prendre une photo</span>
              </Button>

              {/* Captured media grid */}
              {capturedMedia.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {capturedMedia.map((media) => (
                    <div
                      key={media.id}
                      className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                      onClick={() => setSelectedMedia(media)}
                    >
                      <img
                        src={media.dataUrl}
                        alt="Captured"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Eye className="h-6 w-6 text-white" />
                      </div>
                      {media.location && (
                        <div className="absolute bottom-1 left-1">
                          <MapPin className="h-3 w-3 text-white drop-shadow-md" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune photo capturée</p>
                  <p className="text-xs mt-1">Appuyez sur le bouton ci-dessus pour prendre une photo</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Voice Tab */}
        <TabsContent value="voice" className="flex-1 overflow-hidden m-0 mt-2">
          <ScrollArea className="h-full px-4">
            <div className="py-4">
              {/* Recording button */}
              <Button
                variant={isRecording ? "destructive" : "outline"}
                className="w-full mb-4 h-20 flex flex-col gap-2"
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <div className="relative">
                      <MicOff className="h-8 w-8" />
                      <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-ping" />
                    </div>
                    <span>Arrêter ({formatDuration(recordingDuration)})</span>
                  </>
                ) : (
                  <>
                    <Mic className="h-8 w-8" />
                    <span>Enregistrer une note vocale</span>
                  </>
                )}
              </Button>

              {/* Voice notes list */}
              {voiceNotes.length > 0 ? (
                <div className="space-y-3">
                  {voiceNotes.map((note) => (
                    <Card key={note.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <Button variant="outline" size="icon" className="h-10 w-10 rounded-full">
                            <Play className="h-5 w-5" />
                          </Button>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Progress value={0} className="flex-1 h-1" />
                              <span className="text-xs text-muted-foreground">
                                {formatDuration(note.duration)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {note.timestamp.toLocaleTimeString("fr-FR")}
                            </p>
                          </div>
                        </div>
                        {note.isTranscribing && (
                          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Transcription en cours...
                          </div>
                        )}
                        {note.transcription && (
                          <div className="mt-3 p-3 bg-muted rounded-lg">
                            <p className="text-xs font-medium mb-1">Transcription</p>
                            <p className="text-sm">{note.transcription}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Mic className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune note vocale</p>
                  <p className="text-xs mt-1">Appuyez sur le bouton ci-dessus pour enregistrer</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        {/* Phases Tab */}
        <TabsContent value="phases" className="flex-1 overflow-hidden m-0 mt-2">
          <ScrollArea className="h-full px-4">
            <div className="py-4 space-y-3">
              {(Object.keys(PHASE_LABELS) as InvestigationPhase[]).map((phase, index) => {
                const isActive = session?.currentPhase === phase;
                const isPast =
                  session &&
                  Object.keys(PHASE_LABELS).indexOf(session.currentPhase) > index;

                return (
                  <Card
                    key={phase}
                    className={cn(
                      "cursor-pointer transition-colors",
                      isActive && "ring-2 ring-primary",
                      isPast && "opacity-60"
                    )}
                    onClick={() => handleGoToPhase(phase)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          isActive && "bg-primary text-primary-foreground",
                          isPast && "bg-secondary text-primary",
                          !isActive && !isPast && "bg-muted"
                        )}
                      >
                        {isPast ? (
                          <Check className="h-5 w-5" />
                        ) : (
                          PHASE_ICONS[phase]
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{PHASE_LABELS[phase]}</p>
                        <p className="text-xs text-muted-foreground">
                          Phase {index + 1} / {Object.keys(PHASE_LABELS).length}
                        </p>
                      </div>
                      {isActive && (
                        <Badge variant="secondary">En cours</Badge>
                      )}
                      {isPast && (
                        <Badge variant="outline" className="text-primary">
                          Terminé
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Camera overlay */}
      {showCamera && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="flex-1 object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
            <Button variant="ghost" size="icon" className="text-white" onClick={stopCamera}>
              <X className="h-8 w-8" />
            </Button>
            <Button
              size="icon"
              className="h-16 w-16 rounded-full bg-white text-black hover:bg-gray-200"
              onClick={capturePhoto}
            >
              <Camera className="h-8 w-8" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white opacity-0">
              <X className="h-8 w-8" />
            </Button>
          </div>
        </div>
      )}

      {/* Media preview dialog */}
      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Aperçu de la photo</DialogTitle>
            <DialogDescription>
              {selectedMedia?.timestamp.toLocaleString("fr-FR")}
            </DialogDescription>
          </DialogHeader>
          {selectedMedia && (
            <>
              <img
                src={selectedMedia.dataUrl}
                alt="Preview"
                className="w-full rounded-lg"
              />
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Ajoutez une description..."
                  value={selectedMedia.description || ""}
                  onChange={(e) => {
                    setCapturedMedia((prev) =>
                      prev.map((m) =>
                        m.id === selectedMedia.id
                          ? { ...m, description: e.target.value }
                          : m
                      )
                    );
                    setSelectedMedia((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    );
                  }}
                />
              </div>
              {selectedMedia.location && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {selectedMedia.location.coords.latitude.toFixed(6)},{" "}
                    {selectedMedia.location.coords.longitude.toFixed(6)}
                  </span>
                </div>
              )}
            </>
          )}
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => {
                setCapturedMedia((prev) =>
                  prev.filter((m) => m.id !== selectedMedia?.id)
                );
                setSelectedMedia(null);
              }}
            >
              Supprimer
            </Button>
            <Button onClick={() => setSelectedMedia(null)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paramètres</DialogTitle>
            <DialogDescription>
              Configuration de l'investigation mobile
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="autoTranscribe">Transcription automatique</Label>
                <p className="text-xs text-muted-foreground">
                  Convertir les notes vocales en texte
                </p>
              </div>
              <Switch
                id="autoTranscribe"
                checked={settings.autoTranscribe}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, autoTranscribe: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="locationTracking">Géolocalisation</Label>
                <p className="text-xs text-muted-foreground">
                  Ajouter les coordonnées aux photos
                </p>
              </div>
              <Switch
                id="locationTracking"
                checked={settings.locationTracking}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, locationTracking: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="offlineMode">Mode hors ligne</Label>
                <p className="text-xs text-muted-foreground">
                  Sauvegarder localement si pas de connexion
                </p>
              </div>
              <Switch
                id="offlineMode"
                checked={settings.offlineMode}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, offlineMode: checked }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="soundEffects">Effets sonores</Label>
                <p className="text-xs text-muted-foreground">
                  Sons de l'appareil photo et enregistrement
                </p>
              </div>
              <Switch
                id="soundEffects"
                checked={settings.soundEffects}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, soundEffects: checked }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowSettings(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default MobileInvestigation;

