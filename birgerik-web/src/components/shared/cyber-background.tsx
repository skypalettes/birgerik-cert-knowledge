/**
 * サイバー魔法図書館の背景レイヤー。
 * グリッド / 巨大魔法陣 / スキャンライン を固定配置で重ねる。
 * Server Component（JSペイロード無し）。
 */
export function CyberBackground() {
  return (
    <>
      <div className="bg-grid" aria-hidden />
      <svg
        className="bg-magic-circle"
        viewBox="0 0 500 500"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <circle cx="250" cy="250" r="240" fill="none" stroke="#0ff" strokeWidth="2" strokeDasharray="10 5" />
        <circle cx="250" cy="250" r="200" fill="none" stroke="#0ff" strokeWidth="1" />
        <polygon points="250,50 423,350 77,350" fill="none" stroke="#0ff" strokeWidth="2" />
        <polygon points="250,450 423,150 77,150" fill="none" stroke="#0ff" strokeWidth="2" />
        <circle cx="250" cy="250" r="100" fill="none" stroke="#f0f" strokeWidth="1" strokeDasharray="4 4" />
      </svg>
      <div className="scanline" aria-hidden />
    </>
  )
}
