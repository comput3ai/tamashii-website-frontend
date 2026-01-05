{
  miningPoolRpc,
  miningPoolCluster,
  coordinatorCluster,
  backendPath,
  tamashii-website-wasm,
  tamashii-website-shared,
  tamashiiLib,
}:
tamashiiLib.mkWebsitePackage {
  package = "frontend";

  preBuild = ''
    mkdir -p wasm/dist
    cp -r ${tamashii-website-wasm}/* wasm/pkg

    mkdir -p shared
    cp -r ${tamashii-website-shared}/shared/* shared/

    cp ${../../shared/data-provider/tests/resources/llama2_tokenizer.json} frontend/public/tokenizers/
    cp ${../../shared/data-provider/tests/resources/llama3_tokenizer.json} frontend/public/tokenizers/

    cp ${../../shared/client/src/state/prompt_texts/index.json} frontend/public/prompts/
    export VITE_MINING_POOL_RPC=${miningPoolRpc}
    export VITE_BACKEND_PATH=${backendPath}
    export VITE_MINING_POOL_CLUSTER=${miningPoolCluster}
    export VITE_COORDINATOR_CLUSTER=${coordinatorCluster}
  '';

  installPhase = ''
    runHook preInstall

    mkdir -p $out
    cp -r frontend/dist/* $out/

    runHook postInstall
  '';
}
