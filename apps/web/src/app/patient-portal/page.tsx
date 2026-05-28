"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4001";

interface FormData {
  doctorId:    string;
  patientName: string;
  phone:       string;
  email:       string;
  message:     string;
}

const BOT_RESPONSES: Record<string, string> = {
  default: "Thank you for your message. A doctor from our team will review it and respond within 24 hours. For urgent medical concerns, please visit the nearest hospital or call emergency services.",
  appointment: "To book an appointment, please provide your name, phone number, preferred date and the reason for your visit. A doctor will confirm your appointment shortly.",
  emergency: "If this is a medical emergency, please call 112 or go to your nearest emergency room immediately. Do not wait for an online response.",
  results: "Lab results are shared directly through our secure records system. Please ask your doctor to share them with you at your next consultation.",
};

const FAQ = [
  { q: "How do I access my medical records?", a: "Your doctor manages your records in DocTalk. Ask them to print or share your summary at your next visit." },
  { q: "Can I book an appointment online?", a: "Yes — use the chat below to send a booking request. Include your preferred date and reason for visit." },
  { q: "How long does a doctor respond?", a: "Typically within 24 hours on working days. For urgent concerns, visit the hospital directly." },
  { q: "Is my information secure?", a: "Yes. All messages are encrypted and only accessible to your doctor. DocTalk is NDPR-compliant." },
];

function detectIntent(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("emergency") || lower.includes("urgent") || lower.includes("chest pain") || lower.includes("breathing")) return "emergency";
  if (lower.includes("appointment") || lower.includes("book") || lower.includes("schedule")) return "appointment";
  if (lower.includes("result") || lower.includes("lab") || lower.includes("test")) return "results";
  return "default";
}

interface ChatMsg { role: "user" | "bot"; text: string; }

export default function PatientPortalPage() {
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: "bot", text: "Hello! I'm the DocTalk Patient Assistant. I can help you send a message to your doctor, answer common questions, or guide you to the right care. How can I help you today?" },
  ]);
  const [chatInput, setChatInput]   = useState("");
  const [showForm, setShowForm]     = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [openFaq, setOpenFaq]       = useState<number | null>(null);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>();

  const sendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMsgs((prev) => [...prev, { role: "user", text: userMsg }]);

    setTimeout(() => {
      const intent  = detectIntent(userMsg);
      const botReply = BOT_RESPONSES[intent];
      setChatMsgs((prev) => [...prev, { role: "bot", text: botReply }]);
      if (intent === "appointment" || userMsg.toLowerCase().includes("doctor")) {
        setTimeout(() => {
          setChatMsgs((prev) => [...prev, { role: "bot", text: "Would you like to send a direct message to a doctor? Click \"Message a Doctor\" below." }]);
          setShowForm(true);
        }, 800);
      }
    }, 600);
  };

  const onSubmit = async (data: FormData) => {
    await fetch(`${API}/api/v1/inquiries`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, doctorId: data.doctorId || "placeholder-doctor-id" }),
    });
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white">
      {/* Header */}
      <header className="border-b border-[#1E1E1E] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#E85D4A] flex items-center justify-center font-mono text-[11px] font-bold">DT</div>
          <span className="font-serif text-[18px] font-bold">DocTalk</span>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#666] ml-2">Patient Portal</span>
        </div>
        <Link href="/login" className="font-mono text-[11px] uppercase tracking-wider text-[#E85D4A] hover:underline">
          Doctor Login →
        </Link>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Hero */}
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#C9A84C] mb-3">Patient Services // DocTalk</p>
          <h1 className="font-serif text-[40px] md:text-[52px] font-bold leading-tight mb-4">
            Your health,<br />
            <span className="text-[#E85D4A] italic">our priority.</span>
          </h1>
          <p className="font-sans text-[15px] text-[#999] max-w-md mx-auto">
            Chat with our AI assistant, ask questions, or send a direct message to your doctor.
          </p>
        </div>

        {/* AI Chat */}
        <div className="border border-[#222] rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-[#1E1E1E] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#E85D4A]" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-[#666]">Patient Assistant</span>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-[#111]">
            {chatMsgs.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "bot" && (
                  <div className="w-6 h-6 rounded bg-[#E85D4A] flex items-center justify-center font-mono text-[8px] font-bold flex-shrink-0 mt-0.5">DT</div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded text-[13px] leading-relaxed ${
                  m.role === "user" ? "bg-[#E85D4A] text-white" : "bg-[#1A1A1A] text-[#CCC] border border-[#222]"
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 border-t border-[#1E1E1E] flex gap-2 bg-[#0C0C0C]">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendChat()}
              placeholder="Type a question or concern..."
              className="flex-1 bg-[#111] border border-[#222] rounded px-3 py-2 text-[13px] text-white placeholder-[#555] focus:outline-none focus:border-[#E85D4A]"
            />
            <button onClick={sendChat} className="bg-[#E85D4A] text-white font-mono text-[11px] uppercase tracking-wider px-4 py-2 rounded hover:bg-[#D44E3B] transition-colors">
              Send
            </button>
          </div>
        </div>

        {/* Message Doctor Form */}
        {showForm && !submitted && (
          <div className="border border-[#222] rounded-lg p-6">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#C9A84C] mb-1">Direct Message</p>
            <h2 className="font-serif text-[24px] font-bold mb-5">Message a Doctor</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#666] block mb-1">Your Name *</label>
                <input {...register("patientName", { required: true })} className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-[14px] text-white focus:outline-none focus:border-[#E85D4A]" placeholder="Full name" />
                {errors.patientName && <p className="text-[#E85D4A] text-[11px] mt-1">Name is required</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#666] block mb-1">Phone</label>
                  <input {...register("phone")} className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-[14px] text-white focus:outline-none focus:border-[#E85D4A]" placeholder="+234..." />
                </div>
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-[#666] block mb-1">Email</label>
                  <input {...register("email")} type="email" className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-[14px] text-white focus:outline-none focus:border-[#E85D4A]" placeholder="email@example.com" />
                </div>
              </div>
              <div>
                <label className="font-mono text-[10px] uppercase tracking-wider text-[#666] block mb-1">Message *</label>
                <textarea {...register("message", { required: true, minLength: 10 })} rows={4} className="w-full bg-[#111] border border-[#222] rounded px-3 py-2 text-[14px] text-white focus:outline-none focus:border-[#E85D4A] resize-none" placeholder="Describe your concern..." />
                {errors.message && <p className="text-[#E85D4A] text-[11px] mt-1">Please provide more detail (min 10 chars)</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#E85D4A] text-white font-mono text-[12px] uppercase tracking-wider py-3 rounded hover:bg-[#D44E3B] transition-colors disabled:opacity-40">
                {isSubmitting ? "Sending…" : "Send Message"}
              </button>
            </form>
          </div>
        )}

        {submitted && (
          <div className="border border-[#222] rounded-lg p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-green-400 text-xl">✓</span>
            </div>
            <h2 className="font-serif text-[24px] font-bold mb-2">Message sent.</h2>
            <p className="font-mono text-[11px] text-[#666] uppercase tracking-wider">Your doctor will respond within 24 hours.</p>
          </div>
        )}

        {/* FAQ */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#C9A84C] mb-4">Common Questions</p>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-[#222] rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-[#111] transition-colors"
                >
                  <span className="font-sans text-[14px] text-white">{item.q}</span>
                  <span className="font-mono text-[#E85D4A] ml-3">{openFaq === i ? "−" : "+"}</span>
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4">
                    <p className="font-sans text-[13px] text-[#999] leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-center font-mono text-[10px] text-[#444] uppercase tracking-wider">
          DocTalk · Nigeria Medical Records Platform · NDPR Compliant
        </p>
      </div>
    </div>
  );
}
