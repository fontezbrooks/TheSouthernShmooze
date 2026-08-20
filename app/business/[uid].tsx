import { useLocalSearchParams } from "expo-router";
import { BusinessDetailScreen } from "@/features/business-detail/BusinessDetailScreen";

export default function BusinessDetail() {
	const { uid } = useLocalSearchParams<{ uid: string }>();
	return <BusinessDetailScreen uid={uid} />;
}
