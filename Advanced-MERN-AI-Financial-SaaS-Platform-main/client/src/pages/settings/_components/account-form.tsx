import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useAppDispatch, useTypedSelector } from "@/app/hook";
import { Loader, Check, Shuffle } from "lucide-react";
import { useUpdateUserMutation } from "@/features/user/userAPI";
import { updateCredentials } from "@/features/auth/authSlice";

const accountFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Name must be at least 2 characters.",
    })
    .optional(),
  profilePicture: z.string().optional(),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// Avatar styles available from DiceBear
const AVATAR_STYLES = [
  { id: "adventurer", label: "Adventurer", icon: "🧙‍♂️", description: "Fantasy RPG style" },
  { id: "adventurer-neutral", label: "Adventurer Neutral", icon: "⚔️", description: "Neutral adventurer" },
  { id: "avataaars", label: "Avataaars", icon: "🎨", description: "Cartoon style" },
  { id: "avataaars-neutral", label: "Avataaars Neutral", icon: "😊", description: "Neutral cartoon" },
  { id: "bigears", label: "Big Ears", icon: "👂", description: "Fun big ears" },
  { id: "bigsmile", label: "Big Smile", icon: "😄", description: "Happy characters" },
  { id: "bottts", label: "Robots", icon: "🤖", description: "Robot style" },
  { id: "croodles", label: "Croodles", icon: "🎭", description: "Artistic doodles" },
  { id: "croodles-neutral", label: "Croodles Neutral", icon: "✏️", description: "Neutral doodles" },
  { id: "lorelei", label: "Lorelei", icon: "👸", description: "Elegant characters" },
  { id: "micah", label: "Micah", icon: "🌟", description: "Minimalist style" },
  { id: "miniavs", label: "Mini Avatars", icon: "👶", description: "Cute mini style" },
  { id: "notionists", label: "Notionists", icon: "📝", description: "Notion style" },
  { id: "personas", label: "Personas", icon: "💼", description: "Professional personas" },
  { id: "pixel-art", label: "Pixel Art", icon: "🎮", description: "8-bit pixel style" },
  { id: "pixel-art-neutral", label: "Pixel Art Neutral", icon: "👾", description: "Neutral pixels" },
];

// Avatar Style Card
function StyleCard({
  style,
  isSelected,
  onClick,
  isLoading,
}: {
  style: (typeof AVATAR_STYLES)[0];
  isSelected: boolean;
  onClick: () => void;
  isLoading: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      style={{
        position: "relative",
        width: "100%",
        aspect: "1",
        background: isSelected
          ? "linear-gradient(135deg, #6366f120 0%, #8b5cf620 100%)"
          : "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)",
        border: isSelected ? "2.5px solid #6366f1" : "1.5px solid rgba(255,255,255,0.1)",
        borderRadius: 14,
        padding: 0,
        cursor: isLoading ? "not-allowed" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        transition: "all 0.3s cubic-bezier(0.25,1,0.5,1)",
        transform: isSelected ? "scale(1.05)" : "scale(1)",
        boxShadow: isSelected ? "0 0 25px rgba(99, 102, 241, 0.4)" : "none",
        opacity: isLoading ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isLoading && !isSelected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(99, 102, 241, 0.5)";
          el.style.background = "linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.15) 100%)";
          el.style.transform = "scale(1.02)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading && !isSelected) {
          const el = e.currentTarget as HTMLElement;
          el.style.borderColor = "rgba(255,255,255,0.1)";
          el.style.background = "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)";
          el.style.transform = "scale(1)";
        }
      }}
    >
      {/* Style Icon */}
      <div style={{ fontSize: 28, lineHeight: 1 }}>{style.icon}</div>

      {/* Style Label */}
      <span style={{ fontSize: 10, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
        {style.label}
      </span>

      {/* Selection Checkmark */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 24,
            height: 24,
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(99, 102, 241, 0.4)",
            animation: "scaleIn 0.3s cubic-bezier(0.25,1,0.5,1)",
          }}
        >
          <Check size={14} color="white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// Avatar Preview with Regenerate
function AvatarPreview({
  seed,
  style,
  userName,
  onRegenerate,
  isLoading,
}: {
  seed: string;
  style: string;
  userName: string;
  onRegenerate: () => void;
  isLoading: boolean;
}) {
  const avatarUrl = `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}&scale=80&radius=15`;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      {/* Avatar Preview Box */}
      <div
        style={{
          position: "relative",
          width: 180,
          height: 180,
          borderRadius: 28,
          background: "linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%)",
          border: "2px solid rgba(99,102,241,0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: "0 0 40px rgba(99, 102, 241, 0.2)",
        }}
      >
        <img
          src={avatarUrl}
          alt="Avatar preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Regenerate Button */}
        <button
          onClick={onRegenerate}
          disabled={isLoading}
          style={{
            position: "absolute",
            bottom: 12,
            right: 12,
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
            border: "none",
            color: "white",
            cursor: isLoading ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)",
            transition: "all 0.3s",
            opacity: isLoading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              (e.currentTarget as HTMLElement).style.transform = "scale(1.1) rotate(90deg)";
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = "scale(1) rotate(0deg)";
          }}
          title="Generate different avatar"
        >
          <Shuffle size={18} />
        </button>
      </div>

      {/* User Info */}
      <div style={{ textAlign: "center" }}>
        {userName && (
          <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 6 }}>
            {userName}
          </p>
        )}
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
          Click the shuffle icon to generate a new avatar
        </p>
      </div>
    </div>
  );
}

// Style Selector Section
function StyleSelector({
  selectedStyle,
  onStyleSelect,
  isLoading,
}: {
  selectedStyle: string;
  onStyleSelect: (styleId: string) => void;
  isLoading: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={{ margin: "0 0 6px", fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Avatar Style
        </p>
        <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          Choose your avatar style and customize with the shuffle button
        </p>
      </div>

      {/* Style Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
          gap: 10,
          padding: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1.5px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
        }}
      >
        {AVATAR_STYLES.map((style) => (
          <StyleCard
            key={style.id}
            style={style}
            isSelected={selectedStyle === style.id}
            onClick={() => onStyleSelect(style.id)}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Selection Info */}
      {selectedStyle && (
        <div
          style={{
            padding: 12,
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#10b981",
          }}
        >
          <Check size={16} />
          <span>Style selected! Generate and preview your avatar.</span>
        </div>
      )}
    </div>
  );
}

export function AccountForm() {
  const dispatch = useAppDispatch();
  const { user } = useTypedSelector((state) => state.auth);

  const [selectedStyle, setSelectedStyle] = useState("avataaars");
  const [seed, setSeed] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [updateUserMutation, { isLoading }] = useUpdateUserMutation();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: user?.name || "",
      profilePicture: user?.profilePicture || "",
    },
  });

  // Initialize seed on mount
  useEffect(() => {
    const initialSeed = `${user?.name || "user"}-${Date.now()}`;
    setSeed(initialSeed);
  }, [user?.name]);

  // Generate new avatar seed
  const regenerateAvatar = () => {
    const newSeed = `${form.watch("name") || "user"}-${Math.random().toString(36).substring(7)}`;
    setSeed(newSeed);
  };

  // Update avatar URL when style or seed changes
  useEffect(() => {
    if (seed && selectedStyle) {
      setAvatarUrl(`https://api.dicebear.com/9.x/${selectedStyle}/svg?seed=${seed}&scale=80&radius=15`);
    }
  }, [seed, selectedStyle]);

  const onSubmit = async (values: AccountFormValues) => {
    if (isLoading) return;

    if (!selectedStyle || !seed) {
      toast.error("Please generate an avatar first");
      return;
    }

    const formData = new FormData();
    formData.append("name", values.name || "");
    // Store the avatar configuration (style + seed) so it can be regenerated
    formData.append("profilePicture", JSON.stringify({ style: selectedStyle, seed }));

    try {
      const response = await updateUserMutation(formData).unwrap();

      dispatch(
        updateCredentials({
          user: {
            profilePicture: response.data.profilePicture,
            name: response.data.name,
          },
        })
      );

      toast.success("Account updated with your awesome avatar! 🎉");
    } catch (error: any) {
      toast.error(error.data?.message || "Failed to update account");
      console.error("Update error:", error);
    }
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: 40 }}>
          {/* Style Selector */}
          <StyleSelector
            selectedStyle={selectedStyle}
            onStyleSelect={setSelectedStyle}
            isLoading={isLoading}
          />

          {/* Avatar Preview Section */}
          <div style={{ padding: "32px", background: "linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)", border: "1.5px solid rgba(99,102,241,0.15)", borderRadius: 20 }}>
            <AvatarPreview
              seed={seed}
              style={selectedStyle}
              userName={form.watch("name")}
              onRegenerate={regenerateAvatar}
              isLoading={isLoading}
            />
          </div>

          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, display: "block" }}>
                  Your Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      // Update seed when name changes to make avatar reflect changes
                      const newSeed = `${e.target.value}-${Math.random().toString(36).substring(7)}`;
                      setSeed(newSeed);
                    }}
                    style={{
                      padding: "12px 16px",
                      borderRadius: 12,
                      border: "1.5px solid rgba(255,255,255,0.1)",
                      background: "rgba(255,255,255,0.04)",
                      color: "white",
                      fontSize: 14,
                      transition: "all 0.2s",
                    }}
                    onFocus={(e) => {
                      (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)";
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)";
                    }}
                    onBlur={(e) => {
                      (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                      (e.target as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            disabled={isLoading}
            type="submit"
            style={{
              padding: "14px 32px",
              borderRadius: 12,
              background: isLoading
                ? "rgba(99, 102, 241, 0.3)"
                : "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              color: "white",
              fontWeight: 700,
              fontSize: 14,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              transition: "all 0.3s",
              border: "none",
              boxShadow: !isLoading ? "0 4px 16px rgba(99, 102, 241, 0.3)" : "none",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(99, 102, 241, 0.4)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(99, 102, 241, 0.3)";
              }
            }}
          >
            {isLoading && <Loader size={16} style={{ animation: "spin 1s linear infinite" }} />}
            {isLoading ? "Saving Avatar..." : "Save My Avatar"}
          </Button>
        </form>
      </Form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes scaleIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}