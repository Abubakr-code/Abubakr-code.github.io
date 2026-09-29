// "01  BIR JUMLADA" — hairline, index and section name.
const SectionLabel = ({ index, dark = false, children, className = "" }) => (
  <p className={`section-label ${dark ? "section-label--dark" : ""} ${className}`}>
    <span>
      <b>{index}</b>
      {children}
    </span>
  </p>
);

export default SectionLabel;
