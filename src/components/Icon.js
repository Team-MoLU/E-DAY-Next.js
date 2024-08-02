import Image from "next/image";

const Icon = ({ name, size }) => {
  return (
    <Image
      src={`/icon/${name}.svg`}
      alt={`${name} icon`}
      width={size}
      height={size}
    />
  );
};

export default Icon;
