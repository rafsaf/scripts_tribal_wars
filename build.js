require("esbuild")
  .build({
    entryPoints: ["src/collect_troops_v2.ts"],
    minify: true,
    target: ["es2017"],
    platform: "node",
    outdir: "public",
    watch: true,
    legalComments: "inline",
  })
  .then((result) => {
    console.log("watching...");
  });
