import ChatContainer from "../../chat/chatcontainer";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-4xl h-[90vh] max-h-200">
        <ChatContainer />
      </div>
    </main>
  );
}
