import { useRouter } from "next/router";
import MessageContainer from "@/components/Messages/MessageContainer";

const MessagesPage = () => {
  const router = useRouter();
  const { recipientId } = router.query; // Get recipient ID from URL

  return <MessageContainer recipientId={recipientId} />;
};

export default MessagesPage;
