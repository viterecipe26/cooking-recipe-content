
import React from 'react';

const MailIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>;
const SupportIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

export const ContactPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 mb-6">
          Contact Us
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
          We'd love to hear from you! Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
          <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center mb-3">
                <MailIcon />
                <h2 className="text-2xl font-bold text-sky-400">General Inquiries</h2>
            </div>
            <p className="text-slate-300">
              For general questions, partnership opportunities, or media inquiries, please email us at:
            </p>
            <a href="mailto:viterecipe@gmail.com" className="text-teal-400 hover:text-teal-300 transition-colors mt-2 block break-words">
              viterecipe@gmail.com
            </a>
          </div>
          <div className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
             <div className="flex items-center mb-3">
                <SupportIcon />
                <h2 className="text-2xl font-bold text-sky-400">Technical Support</h2>
            </div>
            <p className="text-slate-300">
              If you're experiencing technical issues or need help with the toolkit, our support team is here to help.
            </p>
            <a href="mailto:viterecipe@gmail.com" className="text-teal-400 hover:text-teal-300 transition-colors mt-2 block break-words">
              viterecipe@gmail.com
            </a>
          </div>
        </div>
      </div>
    </main>
  );
};