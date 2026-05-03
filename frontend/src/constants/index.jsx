import { BotMessageSquare } from "lucide-react";
import { BatteryCharging } from "lucide-react";
import { Fingerprint } from "lucide-react";
import { ShieldHalf } from "lucide-react";
import { PlugZap } from "lucide-react";
import { GlobeLock } from "lucide-react";

import user1 from "../assets/profile-pictures/user1.jpg";
import user2 from "../assets/profile-pictures/user2.jpg";
import user3 from "../assets/profile-pictures/user3.jpg";
import user4 from "../assets/profile-pictures/user4.jpg";
import user5 from "../assets/profile-pictures/user5.jpg";
import user6 from "../assets/profile-pictures/user6.jpg";

export const navItems = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Results", href: "#results" },
];

export const testimonials = [
  {
    user: "John Doe",
    company: "Stellar Solutions",
    image: user1,
    text: "I am extremely satisfied with the services provided. The team was responsive, professional, and delivered results beyond my expectations.",
  },
  {
    user: "Jane Smith",
    company: "Blue Horizon Technologies",
    image: user2,
    text: "I couldn't be happier with the outcome of our project. The team's creativity and problem-solving skills were instrumental in bringing our vision to life",
  },
  {
    user: "David Johnson",
    company: "Quantum Innovations",
    image: user3,
    text: "Working with this company was a pleasure. Their attention to detail and commitment to excellence are commendable. I would highly recommend them to anyone looking for top-notch service.",
  },
  {
    user: "Ronee Brown",
    company: "Fusion Dynamics",
    image: user4,
    text: "Working with the team at XYZ Company was a game-changer for our project. Their attention to detail and innovative solutions helped us achieve our goals faster than we thought possible. We are grateful for their expertise and professionalism!",
  },
  {
    user: "Michael Wilson",
    company: "Visionary Creations",
    image: user5,
    text: "I am amazed by the level of professionalism and dedication shown by the team. They were able to exceed our expectations and deliver outstanding results.",
  },
  {
    user: "Emily Davis",
    company: "Synergy Systems",
    image: user6,
    text: "The team went above and beyond to ensure our project was a success. Their expertise and dedication are unmatched. I look forward to working with them again in the future.",
  },
];

export const features = [
  {
    icon: <BotMessageSquare />,
    text: "AI study insights",
    description:
      "See what is helping, what is dragging you down, and what to do next with guidance based on your sessions, notes, and focus patterns.",
  },
  {
    icon: <Fingerprint />,
    text: "Session tracking",
    description:
      "Track active time, breaks, and idle stretches so every study block turns into a clear, honest picture of your effort.",
  },
  {
    icon: <ShieldHalf />,
    text: "Smart recommendations",
    description:
      "Get a next-best action for each moment, whether you should revise, review, or dive deeper into a topic.",
  },
  {
    icon: <BatteryCharging />,
    text: "PDF learning workspace",
    description:
      "Read, annotate, and revisit source material in one focused workspace built for long sessions.",
  },
  {
    icon: <PlugZap />,
    text: "Focus tracking",
    description:
      "Turn attention into a measurable score that helps you notice patterns before they become a slump.",
  },
  {
    icon: <GlobeLock />,
    text: "ML analytics",
    description:
      "Use behavior-driven analytics to understand learning trends across subjects, sessions, and performance.",
  },
];

export const checklistItems = [
  {
    title: "Capture your study session",
    description:
      "Start a timer, mark your task, and let StudyBuddy log the full session without extra friction.",
  },
  {
    title: "Review the signal",
    description:
      "See focus dips, pauses, and momentum shifts so the story behind your time is obvious.",
  },
  {
    title: "Act on the insight",
    description:
      "Use the next recommendation to decide whether to revise, continue, or switch subjects.",
  },
];

export const resourcesLinks = [
  { href: "#features", text: "Features" },
  { href: "#how-it-works", text: "How it works" },
  { href: "#results", text: "Results" },
  { href: "#", text: "Docs" },
];

export const platformLinks = [
  { href: "#", text: "Dashboard" },
  { href: "#", text: "PDF workspace" },
  { href: "#", text: "Study planner" },
  { href: "#", text: "Focus tracker" },
];

export const communityLinks = [
  { href: "#", text: "Students" },
  { href: "#", text: "Study groups" },
  { href: "#", text: "Support" },
  { href: "#", text: "Contact" },
];
