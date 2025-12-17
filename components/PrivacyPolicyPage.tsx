
import React from 'react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <main className="max-w-4xl mx-auto flex-grow w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-slate-700">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 mb-6">
          Privacy Policy
        </h1>
        <div className="prose prose-invert max-w-none text-slate-300 space-y-4">
          <p>Last updated: {new Date().toLocaleDateString()}</p>
          
          <p>
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You.
          </p>
          
          <h2 className="text-2xl font-bold text-sky-400 mt-8">Interpretation and Definitions</h2>
          <p>
            The words of which the initial letter is capitalized have meanings defined under the following conditions. The following definitions shall have the same meaning regardless of whether they appear in singular or in plural.
          </p>
          
          <h2 className="text-2xl font-bold text-sky-400 mt-8">Collecting and Using Your Personal Data</h2>
          <h3 className="text-xl font-semibold text-slate-200 mt-4">Types of Data Collected</h3>
          <p>
            While using Our Service, We may ask You to provide Us with certain personally identifiable information that can be used to contact or identify You. Personally identifiable information may include, but is not limited to: Usage Data. All content you input into the tool is sent to the Gemini API for processing. We do not store your data.
          </p>
          
          <h3 className="text-xl font-semibold text-slate-200 mt-4">Usage Data</h3>
          <p>
            Usage Data is collected automatically when using the Service. Usage Data may include information such as Your Device's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that You visit, the time and date of Your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
          </p>
          
          <h2 className="text-2xl font-bold text-sky-400 mt-8">Use of Your Personal Data</h2>
          <p>
            The Company may use Personal Data for the following purposes:
          </p>
          <ul className="list-disc pl-5">
            <li>To provide and maintain our Service, including to monitor the usage of our Service.</li>
            <li>To manage Your Account: to manage Your registration as a user of the Service.</li>
            <li>For other purposes: We may use Your information for other purposes, such as data analysis, identifying usage trends, determining the effectiveness of our promotional campaigns and to evaluate and improve our Service, products, services, marketing and your experience.</li>
          </ul>

          <h2 className="text-2xl font-bold text-sky-400 mt-8">Changes to this Privacy Policy</h2>
          <p>
            We may update Our Privacy Policy from time to time. We will notify You of any changes by posting the new Privacy Policy on this page. We will let You know via email and/or a prominent notice on Our Service, prior to the change becoming effective and update the "Last updated" date at the top of this Privacy Policy.
          </p>
        </div>
      </div>
    </main>
  );
};