type StarsProps = { value?: number; size?: number };

export default function Stars({ value = 5, size = 14 }: StarsProps) {
  return (
    <span className="stars" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="star"
          style={{
            width: size,
            height: size,
            opacity: i <= Math.round(value) ? 1 : 0.25,
          }}
        />
      ))}
    </span>
  );
}
