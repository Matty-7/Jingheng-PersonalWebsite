// The original hardware texture is clipped separately so the clean deck has no
// baked-in parked arm. The pivot stays in the source image's coordinate system.
export function Tonearm() {
  return (
    <svg className="turntable-arm" viewBox="0 0 1448 1086" aria-hidden="true">
      <defs>
        <clipPath id="tonearm-hardware">
          <path d="M1186 113 Q1187 96 1222 97 Q1260 99 1261 114 L1258 169 Q1255 187 1234 192 L1234 222 Q1254 227 1255 244 L1252 270 L1234 284 L1230 425 L1252 429 L1253 446 L1233 455 L1230 671 L1223 714 L1226 730 L1207 827 L1260 845 L1260 852 L1203 838 L1196 865 L1182 871 L1176 876 L1146 868 L1146 861 L1135 852 L1152 800 L1160 793 L1179 721 L1187 715 L1195 674 L1199 458 L1191 450 L1192 426 L1201 337 L1203 285 L1181 269 L1181 241 Q1180 226 1205 221 L1205 192 Q1186 187 1183 174 Z" />
        </clipPath>
      </defs>
      <g className="tonearm-moving">
        <image
          href="/images/turntable.webp"
          width="1448"
          height="1086"
          clipPath="url(#tonearm-hardware)"
        />
      </g>
    </svg>
  );
}
