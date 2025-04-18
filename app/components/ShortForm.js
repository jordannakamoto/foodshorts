import { useEffect, useRef, useState } from 'react';

export default function ShortForm({ short, onDelete }) {
  const { id } = short;
  const [isPlaying, setIsPlaying] = useState(false);
  const [title, setTitle] = useState(short.title);
  const [tags, setTags] = useState(short.tags.join(', '));
  const [favorite, setFavorite] = useState(short.favorite ?? false);
  const [isStarHovered, setIsStarHovered] = useState(false);
  // Convert single meal to array if it's a string
  const [meals, setMeals] = useState(
    Array.isArray(short.meal) ? short.meal : [short.meal]
  );
  const [isMealExpanded, setIsMealExpanded] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const tagsRef = useRef(null);
  const timeoutRef = useRef(null);

  const updateShort = async (field, value) => {
    await fetch('/api/update-short', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, [field]: value }),
    });
  };

  const handleTagsChange = (e) => {
    const value = e.target.value;
    setTags(value);
    autoResizeTextarea();
    const tagArr = value.split(',').map(t => t.trim());
    updateShort('tags', tagArr);
  };

  // Toggle a meal in or out of the selection
  const toggleMeal = (mealType) => {
    let updatedMeals;
    if (meals.includes(mealType)) {
      // Remove meal if already selected
      updatedMeals = meals.filter(m => m !== mealType);
    } else {
      // Add meal if not already selected
      updatedMeals = [...meals, mealType];
    }
    setMeals(updatedMeals);
    updateShort('meal', updatedMeals);
  };

  const autoResizeTextarea = () => {
    const textarea = tagsRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // reset first
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    autoResizeTextarea();
  }, [isExpanded]);

  const handleLongPressStart = (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (['input', 'textarea', 'select'].includes(tag)) return;
    timeoutRef.current = setTimeout(() => {
      if (confirm('Delete this short?')) onDelete(id);
    }, 600);
  };

  const handleLongPressEnd = () => {
    clearTimeout(timeoutRef.current);
  };

  const mealColors = {
    breakfast: '#FFC107',
    lunch: '#4CAF50',
    dinner: '#2196F3',
    snack: '#FF5722'
  };

  return (
<div
  style={{
    width: 220,
    borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
    position: 'relative',
  }}
  onMouseDown={handleLongPressStart}
  onMouseUp={handleLongPressEnd}
  onTouchStart={handleLongPressStart}
  onTouchEnd={handleLongPressEnd}
>
        {/* Favorite Star */}
        <div
  style={{
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
    cursor: 'pointer',
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }}
  onMouseEnter={() => setIsStarHovered(true)}
  onMouseLeave={() => setIsStarHovered(false)}
  onClick={(e) => {
    e.stopPropagation();
    const newFavorite = !favorite;
    setFavorite(newFavorite);
    updateShort('favorite', newFavorite);
  }}
>
  <span
    style={{
      fontSize: '18px',
      color: favorite ? '#FFD700' : '#ccc',
      opacity: favorite || isStarHovered ? 1 : 0,
      transition: 'opacity 0.2s, color 0.2s',
    }}
  >
    ★
  </span>
</div>
      {/* Video thumbnail/player */}
      <div
        style={{
          width: '100%',
          height: 300,
          cursor: 'pointer',
          position: 'relative',
          backgroundColor: '#000',
        }}
        onClick={() => setIsPlaying(true)}
      >
        {isPlaying ? (
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${id}?autoplay=1`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
            <img
              src={`https://img.youtube.com/vi/${id}/maxresdefault.jpg`}
              alt={title}
              style={{
                width: '100%',
                height: '131%',
                objectFit: 'cover',
                objectPosition: 'center',
                transform: 'translateX(0%)',
              }}
            />
          </div>
        )}
      </div>
      
      {/* Title and expand toggle */}
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateShort('title', e.target.value);
            }}
            style={{ 
              fontSize: '14px', 
              fontWeight: 'bold', 
              flex: 1,
              border: 'none',
              padding: '4px 0',
              outline: 'none',
            }}
            placeholder="Title"
          />
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#ccc',
              fontSize: '10px',
              padding: '0 0 0 4px',
              marginBottom: '2px',
            }}
          >
            {isExpanded ? '▲' : '▼'}
          </button>
        </div>

        {/* Expandable section */}
        {isExpanded && (
          <div style={{ marginTop: '8px' }}>
            {/* Meal selection */}
            <div style={{ marginBottom: '8px' }}>
              {/* Collapsed view - shows comma-separated meal types */}
              {!isMealExpanded ? (
                <div 
                  onClick={() => setIsMealExpanded(true)}
                  style={{
                    fontSize: '12px',
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    backgroundColor: '#f9f9f900',
                  }}
                >
                  {meals.length > 0 
                    ? meals.map(m => m.charAt(0).toUpperCase() + m.slice(1)).join(', ')
                    : "Select meal type"}
                </div>
              ) : (
                /* Expanded checklist */
                <div 
                  style={{
                    fontSize: '12px',
                    width: '100%',
                    border: '1px solid #eee',
                    borderRadius: '4px',
                    padding: '6px',
                    backgroundColor: '#f9f9f900',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>Select meal types</span>
                    <button 
                      onClick={() => setIsMealExpanded(false)} 
                      style={{ fontSize: '10px', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
                    >
                      Done
                    </button>
                  </div>
                  
                  {['breakfast', 'lunch', 'dinner', 'snack', 'desert', 'meal prep', 'other'].map(mealType => (
                    <div key={mealType} style={{ marginBottom: '4px' }}>
                      <label 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          fontSize: '11px',
                          cursor: 'pointer',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={meals.includes(mealType)}
                          onChange={() => toggleMeal(mealType)}
                          style={{ marginRight: '4px' }}
                        />
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Tags input */}
            <textarea
              ref={tagsRef}
              value={tags}
              onChange={handleTagsChange}
              style={{
                fontSize: '12px',
                width: '100%',
                resize: 'none',
                overflow: 'hidden',
                lineHeight: '1.4',
                border: '1px solid #eee',
                borderRadius: '4px',
                padding: '4px 6px',
                backgroundColor: '#f9f9f900'
              }}
              placeholder="Add tags separated by commas"
            />
          </div>
        )}
      </div>
    </div>
  );
}