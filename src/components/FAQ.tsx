import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

const faqs = [
  {
    question: "ডায়মন্ড টপ-আপ করতে কত সময় লাগে?",
    answer: "আমাদের স্বয়ংক্রিয় সিস্টেম সাধারণত সফল পেমেন্ট ভেরিফিকেশনের ১-৫ মিনিটের মধ্যে আপনার ফ্রি ফায়ার ডায়মন্ড ডেলিভারি করে। সার্ভারে চাপ থাকলে কিছুটা বেশি সময় লাগতে পারে।"
  },
  {
    question: "এই সাইটটি কি আমার গেম অ্যাকাউন্টের জন্য নিরাপদ?",
    answer: "অবশ্যই! ডায়মন্ড পাঠানোর জন্য আমাদের শুধু আপনার প্লেয়ার ইউআইডি (UID) প্রয়োজন। আমরা কখনোই আপনার গেম পাসওয়ার্ড বা লগইন তথ্য চাইব না। আপনার অ্যাকাউন্ট ১০০% নিরাপদ।"
  },
  {
    question: "আপনারা কোন কোন পেমেন্ট মেথড সাপোর্ট করেন?",
    answer: "বর্তমানে, আমরা বিকাশ এবং আমাদের নিজস্ব ওয়ালেট সিস্টেমের মাধ্যমে পেমেন্ট গ্রহণ করি। ভবিষ্যতে আরও পেমেন্ট মেথড যুক্ত করার পরিকল্পনা রয়েছে।"
  },
  {
    question: "আমি যদি ভুল ইউআইডি (UID) দিই তাহলে কী হবে?",
    answer: "দুঃখিত, টপ-আপ কমপ্লিট হওয়ার পর সেটি আর বাতিল করা যায় না। অর্ডার প্লেস করার আগে অবশ্যই আপনার ইউআইডি মিলিয়ে নিন। ভুল ইউআইডিতে ডেলিভারি হওয়া ডায়মন্ড ফেরত বা ট্রান্সফার করা সম্ভব নয়।"
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="mt-16 sm:mt-24">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl font-bold uppercase tracking-wider text-white">সাধারণ <span className="text-brand-red">জিজ্ঞাসাসমূহ</span></h2>
        <p className="text-white/50 text-sm mt-2 max-w-2xl mx-auto">কোনো প্রশ্ন আছে? নিচে আমাদের সাধারণ প্রশ্ন ও উত্তরগুলো দেখে নিতে পারেন।</p>
      </div>

      <div className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="bg-brand-card border border-white/5 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left focus:outline-none transition-colors hover:bg-white/[0.02]"
            >
              <span className="font-medium text-white sm:text-base text-sm pr-4">{faq.question}</span>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-brand-red transition-transform duration-300 flex-shrink-0",
                  openIndex === index ? "rotate-180" : ""
                )} 
              />
            </button>
            <AnimatePresence>
              {openIndex === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 sm:p-5 pt-0 text-white/60 text-sm leading-relaxed border-t border-white/5 mt-2">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
