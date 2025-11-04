function BackgroundShape() {
  return (
    <div className="absolute top-0 right-0 h-full w-2/5 z-0 pointer-events-none">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <polygon
          points="35,0 100,0 100,100 15,100"
          style={{
            fill: '#33806b', // Darker green fill
            stroke: '#52ac95', // Lighter green border
            strokeWidth: '5',  // Adjust border thickness
          }}
        />
      </svg>
    </div>
  );
}

export default BackgroundShape;



