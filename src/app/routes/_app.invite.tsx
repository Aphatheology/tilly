import { createFileRoute, Link } from "@tanstack/react-router"
import { useIsAuthenticated, useAccount } from "jazz-tools/react"
import { Group, type ID } from "jazz-tools"
import { T, useIntl } from "#shared/intl/setup"
import { ExclamationTriangle } from "react-bootstrap-icons"
import { Person, UserAccount } from "#shared/schema/user"
import { IbaadahGroup } from "#shared/schema/group"
import { co } from "jazz-tools"
import { toast } from "sonner"
import { useState, useEffect, useRef } from "react"
import { Button } from "#shared/ui/button"
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "#shared/ui/empty"
import { Spinner } from "#shared/ui/spinner"
import { getSignInUrl, getSignUpUrl } from "#app/lib/auth-utils"

export const Route = createFileRoute("/_app/invite")({
	loader: () => {
		let inviteData = getOrRestoreInviteData()
		return { inviteData }
	},
	component: InviteScreen,
})

let PENDING_INVITE_KEY = "tilly:pending-invite"

type InviteData =
	| {
			type: "person"
			personId: string
			inviteGroupId: string
			inviteSecret: string
	  }
	| {
			type: "group"
			groupId: string
			inviteGroupId: string
			inviteSecret: string
	  }

function InviteScreen() {
	let { inviteData } = Route.useLoaderData()
	let isAuthenticated = useIsAuthenticated()

	if (!inviteData) {
		return <InvalidInviteState />
	}

	if (!isAuthenticated) {
		return <SignInPromptState />
	}

	return <AcceptInviteHandler inviteData={inviteData} />
}

function AcceptInviteHandler({ inviteData }: { inviteData: InviteData }) {
	let account = useAccount(UserAccount, {
		resolve: { root: { people: true, ibaadahGroups: { $each: true } } },
	})
	let isAuthenticated = useIsAuthenticated()
	let navigate = Route.useNavigate()
	let t = useIntl()
	let [error, setError] = useState("")
	let [isRevoked, setIsRevoked] = useState(false)
	let [isProcessing, setIsProcessing] = useState(true)
	let acceptingRef = useRef(false)

	useEffect(() => {
		async function acceptInvite() {
			if (!account.$isLoaded || !isAuthenticated) return
			if (acceptingRef.current) return
			acceptingRef.current = true

			try {
				await account.acceptInvite(
					inviteData.inviteGroupId as ID<Group>,
					inviteData.inviteSecret as `inviteSecret_z${string}`,
					Group,
				)

				clearPendingInvite()

				if (inviteData.type === "person") {
					let person = await Person.load(
						inviteData.personId as ID<typeof Person>,
						{
							resolve: { avatar: true },
						},
					)

					if (!person?.$isLoaded) {
						setIsRevoked(true)
						setIsProcessing(false)
						return
					}

					let freshAccount = await UserAccount.load(account.$jazz.id, {
						resolve: { root: { people: true } },
					})
					let alreadyHas =
						freshAccount?.$isLoaded &&
						freshAccount.root.people.some(
							p => p?.$jazz.id === inviteData.personId,
						)

					if (!alreadyHas) {
						account.root.people.$jazz.push(person)
						toast.success(t("invite.success", { name: person.name }))
					}

					navigate({
						to: "/people/$personID",
						params: { personID: inviteData.personId },
					})
				} else {
					let group = await IbaadahGroup.load(
						inviteData.groupId as ID<typeof IbaadahGroup>,
					)
					if (!group?.$isLoaded) {
						setIsRevoked(true)
						setIsProcessing(false)
						return
					}

					let freshAccount = await UserAccount.load(account.$jazz.id, {
						resolve: { root: { ibaadahGroups: { $each: true } } },
					})
					let alreadyHas =
						freshAccount?.$isLoaded &&
						freshAccount.root.ibaadahGroups?.some(
							g => g?.$jazz.id === inviteData.groupId,
						)

					let groupsList = account.root.ibaadahGroups
					if (!groupsList) {
						account.root.$jazz.set(
							"ibaadahGroups",
							co.list(IbaadahGroup).create([]),
						)
						groupsList = account.root.ibaadahGroups
					}

					if (!alreadyHas && groupsList) {
						groupsList.$jazz.push(group)
						toast.success(t("invite.success.group", { name: group.name }))
					}

					navigate({
						to: "/groups/$groupID",
						params: { groupID: inviteData.groupId },
					})
				}
			} catch (err) {
				console.error("Failed to accept invite:", err)
				setError(t("invite.error.failed"))
				setIsProcessing(false)
			}
		}

		acceptInvite()
	}, [account.$isLoaded, isAuthenticated, inviteData, navigate, t, account])

	if (isRevoked) {
		return <RevokedInviteState />
	}

	if (error) {
		return <ErrorState message={error} />
	}

	if (isProcessing) {
		return <LoadingState />
	}

	return <LoadingState />
}

function LoadingState() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<Spinner className="size-8" />
					</EmptyMedia>
					<EmptyTitle>
						<T k="invite.accepting" />
					</EmptyTitle>
					<EmptyDescription>
						<T k="invite.loading.description" />
					</EmptyDescription>
				</EmptyHeader>
			</Empty>
		</div>
	)
}

function InvalidInviteState() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<ExclamationTriangle className="size-8" />
					</EmptyMedia>
					<EmptyTitle>
						<T k="invite.error.invalid.title" />
					</EmptyTitle>
					<EmptyDescription>
						<T k="invite.error.invalid.description" />
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<Link to="/people">
							<T k="invite.error.invalid.action" />
						</Link>
					</Button>
				</EmptyContent>
			</Empty>
		</div>
	)
}

function RevokedInviteState() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<ExclamationTriangle className="size-8" />
					</EmptyMedia>
					<EmptyTitle>
						<T k="invite.error.revoked.title" />
					</EmptyTitle>
					<EmptyDescription>
						<T k="invite.error.revoked.description" />
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<Link to="/people">
							<T k="invite.error.invalid.action" />
						</Link>
					</Button>
				</EmptyContent>
			</Empty>
		</div>
	)
}

function ErrorState({ message }: { message: string }) {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Empty>
				<EmptyHeader>
					<EmptyMedia variant="icon">
						<ExclamationTriangle className="size-8" />
					</EmptyMedia>
					<EmptyTitle>
						<T k="invite.error.failed.title" />
					</EmptyTitle>
					<EmptyDescription>{message}</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild>
						<Link to="/people">
							<T k="invite.error.invalid.action" />
						</Link>
					</Button>
				</EmptyContent>
			</Empty>
		</div>
	)
}

function SignInPromptState() {
	return (
		<div className="flex min-h-[50vh] items-center justify-center">
			<Empty>
				<EmptyHeader>
					<EmptyTitle>
						<T k="invite.signIn.title" />
					</EmptyTitle>
					<EmptyDescription>
						<T k="invite.signIn.description" />
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent>
					<Button asChild className="w-full">
						<a href={getSignInUrl("/app/invite")}>
							<T k="auth.signIn.button" />
						</a>
					</Button>
					<Button variant="outline" asChild className="w-full">
						<a href={getSignUpUrl("/app/invite")}>
							<T k="auth.signUp.button" />
						</a>
					</Button>
				</EmptyContent>
			</Empty>
		</div>
	)
}

function parseInviteHash(hash: string): InviteData | null {
	let personMatch = hash.match(
		/^#\/person\/(co_[^/]+)\/invite\/(co_[^/]+)\/(inviteSecret_[^/]+)$/,
	)
	if (personMatch) {
		return {
			type: "person",
			personId: personMatch[1],
			inviteGroupId: personMatch[2],
			inviteSecret: personMatch[3],
		}
	}
	let groupMatch = hash.match(
		/^#\/group\/(co_[^/]+)\/invite\/(co_[^/]+)\/(inviteSecret_[^/]+)$/,
	)
	if (groupMatch) {
		return {
			type: "group",
			groupId: groupMatch[1],
			inviteGroupId: groupMatch[2],
			inviteSecret: groupMatch[3],
		}
	}
	return null
}

function getOrRestoreInviteData(): InviteData | null {
	if (typeof window === "undefined") return null

	let currentHash = window.location.hash
	let parsed = parseInviteHash(currentHash)
	if (parsed) {
		localStorage.setItem(PENDING_INVITE_KEY, currentHash)
		return parsed
	}

	let pending = localStorage.getItem(PENDING_INVITE_KEY)
	if (pending) {
		window.location.hash = pending
		return parseInviteHash(pending)
	}

	return null
}

function clearPendingInvite() {
	localStorage.removeItem(PENDING_INVITE_KEY)
}
