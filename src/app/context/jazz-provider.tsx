import { useAccount as useJazzAccount } from "jazz-tools/react"
import { UserAccount } from "#shared/schema/user"

export function useAccount() {
	let me = useJazzAccount(UserAccount)
	return { me }
}
