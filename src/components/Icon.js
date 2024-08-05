import { useEffect, useState } from "react";

const Icon = ({ name, size, color = "#F2F3FA" }) => {
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    fetch(`/icon/${name}.svg`)
      .then((response) => response.text())
      .then((svg) => {
        // viewBox를 추출하거나 기본값을 설정합니다
        const viewBoxMatch = svg.match(/viewBox="([^"]*)"/) || [
          "",
          "0 0 24 24",
        ];
        const viewBox = viewBoxMatch[1];

        // SVG를 수정하여 크기와 색상을 적용합니다
        const modifiedSvg = svg
          .replace(
            /<svg([^>]*)>/,
            (match, p1) =>
              `<svg${p1} width="${size}" height="${size}" viewBox="${viewBox}">`
          )
          .replace(/stroke="[^"]*"/g, `stroke="${color}"`)
          .replace(/width="[^"]*"/, `width="${size}"`)
          .replace(/height="[^"]*"/, `height="${size}"`);

        setSvgContent(modifiedSvg);
      });
  }, [name, size, color]);

  return <div dangerouslySetInnerHTML={{ __html: svgContent }} />;
};

export default Icon;
