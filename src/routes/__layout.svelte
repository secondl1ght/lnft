<script context="module">
  export async function load({ fetch, page, session }) {
    const props = await fetch(`/addresses.json`).then((r) => r.json());

    if (
      session &&
      session.user &&
      !session.user.wallet_initialized &&
      !["/wallet", "/logout"].find((p) => page.path.includes(p))
    )
      return {
        status: 302,
        redirect: "/wallet/setup",
      };

    return {
      maxage: 90,
      props,
    };
  }

</script>

<script>
  import { browser } from "$app/env";
  import { page, session } from "$app/stores";
  import decode from "jwt-decode";
  import { Sidebar, Navbar, Dialog, Footer, Snack, Head } from "$comp";
  import {
    addresses as a,
    meta,
    titles as t,
    user,
    password,
    token,
  } from "$lib/store";
  import { onMount } from "svelte";
  import branding from "$lib/branding";

  export let addresses, titles;

  if (browser)
    history.pushState = new Proxy(history.pushState, {
      apply(target, thisArg, argumentsList) {
        Reflect.apply(target, thisArg, argumentsList);
        scrollTo(0, 0);
      },
    });

  $a = addresses;
  $t = titles;

  $user = $session.user;
  $token = $session.jwt;

  let open = false;
  let y;

  onMount(() => {
    if (!$password) $password = window.sessionStorage.getItem("password");
  });

</script>

<style global src="../main.css">
</style>

<svelte:window bind:scrollY={y} />

<Head metadata={branding.meta} />

<Snack />

<Sidebar bind:open />
<div class={y > 50 ? 'sticky' : ''}>
  <Navbar bind:sidebar={open} />
</div>
<Dialog />

<main>
  <div class="mx-auto min-h-screen">
    <slot />
  </div>
</main>

<Footer />
