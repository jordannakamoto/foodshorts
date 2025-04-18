import ShortForm from './ShortForm';

export default function ShortGrid({ shorts, onDelete, onEdit }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20 }}>
      {shorts.map(short => (
        <ShortForm key={short.id} short={short} onDelete={onDelete} onEdit={onEdit} />
      ))}
    </div>
  );
}