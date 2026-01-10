export type FirstActionType = {
    label: string
    action: () => void
    requiresFullSetup?: boolean
}