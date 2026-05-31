import { useSnapshot } from '../../hooks/useSnapshot'
import './widget.css'

interface Props {
    onExpand: () => void
}

export default function Widget({ onExpand }: Props) {
    const { snapshot, loading } = useSnapshot()

    return (
        <div className="widget" onClick={onExpand}>
        <div className="widget-focus">
            <span className="widget-focus-label">focus</span>
            <p className="widget-focus-text">No urgent items</p>
        </div>
        <div className="widget-snapshot">
            <span>LC: —</span>
            <span>Exercise: —</span>
            <span>Internships: {loading ? '—' : snapshot.internships}</span>
            <span>Reminders: {loading ? '—' : snapshot.reminders}</span>
            <span>Todos: {loading ? '—' : snapshot.todos}</span>
        </div>
        </div>
    )
}