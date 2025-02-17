export default function MeetPage() {
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      <h1 className="text-3xl mb-4">Join a Video Meeting</h1>
      <a href="https://video-call-tau-orcin.vercel.app/sign-in" target="_blank" rel="noopener noreferrer">
        <button className="px-6 py-3 bg-blue-500 rounded-lg text-lg">
          Go to Zoom-Clone
        </button>
      </a>
    </div>
  );
}
