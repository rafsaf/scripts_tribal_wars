require("esbuild")
  .build({
    entryPoints: ["src/collect_troops_v2.ts", "src/collect_troops_v2.1.ts"],
    target: ["es2017"],
    outdir: "public",
    minify: true,
    watch: true,
    legalComments: "inline",
  })
  .then((result) => {
    console.log("watching...");
  });
