"use client";

import { useEffect, useState } from "react";

interface CMSItem {
  title?: string;
  content?: string;
}

export default function AboutCF() {
  const [cmsItem, setCmsItem] = useState<CMSItem | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/static-content/about_cf?_=${Date.now()}`)
      .then((r) => r.json())
      .then((res) => {
        if (res?.success && res?.data) {
          setCmsItem(res.data);
        }
      })
      .catch((err) => console.error('[AboutCF] CMS fetch error:', err));
  }, []);

  const title = cmsItem?.title || "About CF";
  const contentText = cmsItem?.content;

  return (
    <main className="min-h-screen p-6">
      <div
        className="max-w-3xl mx-auto rounded-2xl border border-white/10 shadow-xl overflow-hidden"
        style={{ background: "#0E0E0E" }}
      >
        <header className="px-6 sm:px-8 pt-8 pb-4 bg-[#0E0E0E]">
          <h1
            className="text-[32px] sm:text-[42px] md:text-[55px] font-bold text-white text-center uppercase tracking-normal"
            style={{ fontFamily: 'var(--font-oswald), "Oswald", sans-serif' }}
          >
            {title}
          </h1>
        </header>

        <div className="p-6 sm:p-8 flex flex-col gap-4 text-white/90 leading-relaxed whitespace-pre-line">
          {contentText ? (
            <p>{contentText}</p>
          ) : (
            <>
              <p>
                {`Welcome to Champion Footballer, where football, competition and bragging rights come together. Every match counts, every performance matters and every player has the opportunity to make their mark.`}
              </p>
              <p>
                {`Whether you're playing for fun, competing with friends, taking on rivals or chasing the top spot, this is your game. Make your contribution, deliver winning performances, earn XP and climb the rankings. Whatever your position, ability or experience, there's always something to play for.`}
              </p>
              <p className="font-bold text-white uppercase tracking-wide">
                {`OUR JOURNEY: FROM 2015 TO A NEW ERA OF FOOTBALL.`}
              </p>
              <p>
                {`Our journey began in 2015 with a vision to bring grassroots football and competition together. Following the launch of our first web app in 2022, Champion Footballer now enters its next chapter with a dedicated mobile app, bringing the entire experience straight to your fingertips.`}
              </p>
              <p className="font-bold text-white uppercase tracking-wide">
                {`YOUR GAME. YOUR STATS. YOUR LEGACY.`}
              </p>
              <p>
                {`Create your player profile, organise matches with ease, build your squads and bring your competitions to life. Track your appearances, wins, performances and individual statistics. Earn XP, unlock achievements and climb the rankings. Celebrate your success in your very own Trophy Room, where every match adds another chapter to your football story.`}
              </p>
              <p className="font-bold text-white uppercase tracking-wide">
                {`DON'T JUST PLAY THE GAME. OWN YOUR RANKING.`}
              </p>
              <p>
                {`Every performance is an opportunity to rise. Compete in league tables, challenge your rivals and fight for the number one spot. With player rankings, match history, virtual awards and our unique Match Win Contribution Index, we recognise more than just goals and assists. Every tackle, save, pass, interception and contribution can make a difference.`}
              </p>
              <p>
                {`Earn Player of the Match, collect achievements, build your reputation and give your rivals something to chase. From your first XP milestone to the top of the leaderboard, there's always another challenge to take on and another achievement to unlock.`}
              </p>
              <p className="font-bold text-white uppercase tracking-wide">
                {`EVERY PLAYER HAS A STORY. EVERY MATCH BUILDS A LEGACY.`}
              </p>
              <p>
                {`Champion Footballer brings together the passion of grassroots football, the excitement of competition and the spirit of playing with friends.`}
              </p>
              <p>
                {`It's where casual kickabouts become competitions, friendships become rivalries and every player gets the opportunity to be recognised.`}
              </p>
              <p>
                {`Your matches. Your achievements. Your rankings. Your legacy.`}
              </p>
              <p className="font-bold text-white">
                {`The final whistle might end the match. The competition never stops.`}
              </p>
            </>
          )}
        </div>

        <footer className="px-6 sm:px-8 pb-8 pt-4 border-t border-white/10 bg-[#0E0E0E]">
          <p className="text-xs sm:text-sm text-white">
            Built with love for the global football community.
          </p>
        </footer>
      </div>
    </main>
  );
}







// "use client"

// import { useEffect } from "react"
// import Link from "next/link"

// export default function AboutCF() {
//   useEffect(() => {
//     window.scrollTo({ top: 0 })
//   }, [])

//   return (
//     <div className='p-6 bg-[#d6ffd1]'>
//       <div className="mb-5 text-3xl font-semibold">About CF</div>
//       <div className="flex flex-col gap-2">
//         <p>
//           {`CF helps organise and records your football matches including number of games won, lost and goals scored when
//           playing football matches with your friends. It's a free service which allows you to connect your passion for
//           football with other football enthusiast.`}
//         </p>
//         <p>
//          {` CF can be used for all occasions, whether playing a 5 or 7 aside football matches on an artificial pitch,
//           weekend kick around at the park or playing in your local "cage" to showcase your lethal ball skills. Why not
//           make it rewarding and competitive!`}
//         </p>
//         <p>
//          {` CF platform provides user friendly features to easily arrange football matches with your friends. Including;
//           adding date/time, location of match and picking teams from a real-time player availability list.`}
//         </p>
//         <p>
//         {`  On CF you can have fun in setting up your player card, arrange a series of matches, mix up the teams every
//           time you play and see who comes up on top with the greatest number of wins!`}
//         </p>
//         <p>
//           {`After each match is played, you can go ahead and rate your best player on the pitch and win virtual awards.`}
//         </p>
//         <p>
// {`          CF can help you have fun playing the world's most loved sport, providing you with a unique experience that
//           connects football fans all around the world. It's a fun way to bring social media experience and playing
//           football together!`}
//         </p>
//         <p className="font-bold">{`Become Champion Footballer!`}</p>
//         <p>
//          {` CF is for everyone at all playing levels, who would like to relish the chance to become their local champion!`}{" "}
//           <Link href="/" className="font-bold text-blue-500 hover:text-blue-700 hover:underline">
//             Sign-up
//           </Link>{" "}
//          {` now to join an existing league or create a new league/group and invite your friends to play.`}
//         </p>
//       </div>
//     </div>
//   )
// }
