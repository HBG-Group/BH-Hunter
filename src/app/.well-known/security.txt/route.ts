const body = `Contact: https://github.com/HBG-Group/BH-Hunter/security/advisories/new
Contact: https://github.com/HBG-Group/BH-Hunter/issues
Policy: https://github.com/HBG-Group/BH-Hunter/blob/feature/improved-security/docs/VULNERABILITY_DISCLOSURE.md
Expires: 2027-07-27T00:00:00.000Z
Preferred-Languages: en
Canonical: https://github.com/HBG-Group/BH-Hunter
`;

export async function GET() {
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
