import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const allReviews = [
  { id: 1, name: 'Arif_Fire', rating: 5, comment: 'Very fast delivery! I received 520 diamonds in just 2 minutes.', date: '2 days ago' },
  { id: 2, name: 'PRO_Killer2023', rating: 5, comment: 'Trustworthy site. I use Nagad and it works flawlessly every time.', date: '1 week ago' },
  { id: 3, name: 'Sabbir H.', rating: 4, comment: 'Good service, but weekly pass sometimes takes 5-10 minutes. Still the best.', date: '1 week ago' },
  { id: 4, name: 'Tanjim_Roy', rating: 5, comment: 'Drubo is the best! Great user interface and very easy to use.', date: '2 weeks ago' },
  { id: 5, name: 'Gaming_Boss', rating: 5, comment: '100% trusted. Loved the instant delivery system!', date: '1 day ago' },
  { id: 6, name: 'BD_Fighter', rating: 5, comment: 'Cheap price and reliable service. Highly recommended.', date: '3 days ago' },
  { id: 7, name: 'Nirob_Hasan', rating: 4, comment: 'Payment was fast, delivery took a couple of minutes.', date: '4 days ago' },
  { id: 8, name: 'Hero_Alom', rating: 5, comment: 'Always getting diamonds from here. Super fast!', date: '5 days ago' },
  { id: 9, name: 'Sakib_Gamer', rating: 5, comment: 'Best top up site in Bangladesh. Great job!', date: '1 week ago' },
  { id: 10, name: 'Raju_FF', rating: 4, comment: 'Sometimes slow, but mostly instant. Keep it up!', date: '1 week ago' },
  { id: 11, name: 'Milon_Vai', rating: 5, comment: 'Got my level up pass very quickly. Thanks.', date: '2 weeks ago' },
  { id: 12, name: 'FF_Legend', rating: 5, comment: 'Very smooth checkout experience using bKash.', date: '2 weeks ago' },
  { id: 13, name: 'Kader_Master', rating: 5, comment: 'Evo access delivery was instant. 10/10.', date: '3 weeks ago' },
  { id: 14, name: 'Sujon_Ahmed', rating: 4, comment: 'Good site. Clean UI. Love to buy from here.', date: '1 month ago' },
  { id: 15, name: 'Op_Gamer', rating: 5, comment: 'My favorite place for Free Fire topups.', date: '1 month ago' },
  { id: 16, name: 'Bad_Boy', rating: 5, comment: 'Trustworthy and reliable guys. Buy without tension.', date: '1 month ago' },
  { id: 17, name: 'King_Khan', rating: 5, comment: 'Awesome support! Solved my issue in no time.', date: '1 month ago' },
  { id: 18, name: 'Nobita_FF', rating: 4, comment: 'Overall a good experience. Prices are reasonable.', date: '2 months ago' },
  { id: 19, name: 'Shakil_Op', rating: 5, comment: 'Have done 10+ topups here, no issues at all.', date: '2 months ago' },
  { id: 20, name: 'Emon_Dash', rating: 5, comment: 'Just wow! Instant diamond topup via player id.', date: '2 months ago' }
];

export default function Reviews() {
  const [startIndex, setStartIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStartIndex((prev) => (prev + 5) % allReviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const visibleReviews = allReviews.slice(startIndex, startIndex + 5);

  return (
    <section className="mt-16 sm:mt-24">
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl font-bold uppercase tracking-wider text-white">গেমারদের <span className="text-brand-orange">মতামত</span></h2>
        <p className="text-white/50 text-sm mt-2 max-w-2xl mx-auto">আমাদের হাজারো সন্তুষ্ট গ্রাহকের রিভিউগুলো পড়ে দেখুন।</p>
      </div>

      <div className="overflow-hidden px-2">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {visibleReviews.map((review, i) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -50, scale: 0.9 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-brand-card border border-white/5 p-5 rounded-xl transition-all hover:border-white/10 hover:bg-white/[0.02]"
              >
                <div className="flex text-brand-orange mb-3">
                  {[...Array(review.rating)].map((_, idx) => <Star key={idx} className="w-4 h-4 fill-current" />)}
                  {[...Array(5 - review.rating)].map((_, idx) => <Star key={idx + 5} className="w-4 h-4 text-white/10" />)}
                </div>
                <p className="text-white/80 text-sm mb-4 leading-relaxed line-clamp-3">
                  "{review.comment}"
                </p>
                <div className="flex justify-between items-center mt-auto pt-4 border-t border-white/5">
                  <span className="font-bold text-white text-sm">{review.name}</span>
                  <span className="text-[10px] text-white/30 uppercase font-semibold">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
