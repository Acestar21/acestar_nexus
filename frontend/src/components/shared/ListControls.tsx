import type { SortMode } from '../../utils/sort'
import './list-controls.css'

interface Props {
	sort: SortMode
	onSortChange: (mode: SortMode) => void
}

export default function ListControls({ sort, onSortChange }: Props) {
	return (
		<div className="list-controls">
			<label className="list-controls-label" htmlFor="list-sort">
				Sort
			</label>
			<select
				id="list-sort"
				className="select list-controls-select"
				value={sort}
				onChange={e => onSortChange(e.target.value as SortMode)}
			>
				<option value="priority">Priority (high → low)</option>
				<option value="created-desc">Date added (newest first)</option>
				<option value="created-asc">Date added (oldest first)</option>
			</select>
		</div>
	)
}
