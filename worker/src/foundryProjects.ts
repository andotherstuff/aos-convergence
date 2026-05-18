// Foundry projects, mirrored from andotherstuff.org (#foundry-projects in the
// public andotherstuff/website repo). This is PUBLIC data, so unlike attendee
// data it is safe to commit. Merged + de-duplicated against the gated attendee
// project list by the worker.

export interface FoundryProject {
  id: string;
  title: string;
  description: string;
  site: string;
  repo: string;
  /** `/logos/*` image path, OR an emoji glyph when there is no logo file. */
  logo: string;
  /** Optional tile background — needed for light/white logos (e.g. White Noise). */
  logoBg?: string;
  tags: string[];
  source: 'foundry';
}

export const FOUNDRY_PROJECTS: FoundryProject[] = [
  {
    id: 'foundry-shakespeare',
    title: 'Shakespeare',
    description:
      'An AI-first development platform for building and deploying websites. Connect with builders worldwide, use version control and one-click deployment, and choose from 40+ AI models across multiple providers. Built on Nostr.',
    site: 'https://shakespeare.diy',
    repo: 'https://gitlab.com/soapbox-pub/shakespeare',
    logo: '/logos/shakespeare.svg',
    tags: ['AI', 'Nostr', 'Web Development'],
    source: 'foundry',
  },
  {
    id: 'foundry-agora',
    title: 'Agora',
    description:
      'Connect with activists worldwide. Send support to activists on the ground internationally and take part in local actions. Built on Nostr, the decentralized protocol.',
    site: 'https://agora.spot',
    repo: 'https://gitlab.com/soapbox-pub/agora',
    logo: '/logos/agora.png',
    tags: ['Activism', 'Nostr', 'Community'],
    source: 'foundry',
  },
  {
    id: 'foundry-clawi',
    title: 'Clawi',
    description:
      'Clawi.ai is a managed AI agent deployment platform designed for both personal use and team collaboration. Infrastructure, security, and reliability are handled; agents run continuously in the cloud, accessible through many messaging platforms.',
    site: 'https://clawi.ai',
    repo: 'https://github.com/callebtc/openclaw',
    logo: '/logos/clawi_logo.png',
    tags: ['AI', 'Agent', 'Productivity'],
    source: 'foundry',
  },
  {
    id: 'foundry-ditto',
    title: 'Ditto',
    description:
      'A fully customizable social platform built on Nostr. Infinite content types, deep theming, and a bridge to the open web — Bluesky, Mastodon, and the broader Nostr ecosystem.',
    site: 'https://ditto.pub',
    repo: 'https://gitlab.com/soapbox-pub/ditto',
    logo: '/logos/ditto.svg',
    tags: ['Social', 'Nostr', 'Customization'],
    source: 'foundry',
  },
  {
    id: 'foundry-divine',
    title: 'Divine',
    description:
      'A platform for creating and sharing short-form looping videos on the Nostr protocol. Decentralized video content without centralized control or censorship.',
    site: 'https://divine.video',
    repo: 'https://github.com/rabble/nostrvine',
    logo: '/logos/Divine-512.png',
    tags: ['Video', 'Nostr', 'Social Media'],
    source: 'foundry',
  },
  {
    id: 'foundry-whitenoise',
    title: 'White Noise',
    description:
      'A secure and private messaging application built on Nostr and the MLS protocol, ensuring end-to-end encryption, identity freedom, and decentralized communication.',
    site: 'https://whitenoise.chat',
    repo: 'https://github.com/parres-hq/whitenoise',
    logo: '/logos/whitenoise.svg',
    logoBg: '#0f100f',
    tags: ['Messaging', 'Privacy', 'Nostr'],
    source: 'foundry',
  },
  {
    id: 'foundry-flotilla',
    title: 'Flotilla',
    description:
      'A customizable community platform for branded social media spaces — event calendars, chat rooms, content curation, built on Nostr.',
    site: 'https://flotilla.social',
    repo: 'https://github.com/coracle-social/flotilla',
    logo: '/logos/flotilla.webp',
    tags: ['Community', 'Nostr', 'Social Platform'],
    source: 'foundry',
  },
  {
    id: 'foundry-cashu',
    title: 'Cashu',
    description:
      'A privacy-preserving digital cash protocol built on Bitcoin. Instant, private, offline-capable payments using ecash tokens.',
    site: 'https://cashu.space',
    repo: 'https://github.com/cashubtc',
    logo: '/logos/cashu.png',
    tags: ['Bitcoin', 'Payments', 'Privacy'],
    source: 'foundry',
  },
  {
    id: 'foundry-chorus',
    title: 'Chorus',
    description:
      'A decentralized community platform for creators and audiences — direct artist/fan connections, collaboration and community tools on open protocols.',
    site: 'https://chorus.community',
    repo: 'https://github.com/andotherstuff/chorus',
    logo: '/logos/chorus.svg',
    tags: ['Community', 'Creators', 'Decentralized'],
    source: 'foundry',
  },
  {
    id: 'foundry-bitchat',
    title: 'bitchat',
    description:
      'A decentralized peer-to-peer messaging app over Bluetooth mesh networks. Offline communication without internet, accounts, or central servers.',
    site: 'https://bitchat.free',
    repo: 'https://github.com/permissionlesstech/bitchat',
    logo: '/logos/bitchat.png',
    tags: ['Messaging', 'Offline', 'Bluetooth'],
    source: 'foundry',
  },
  {
    id: 'foundry-marmot',
    title: 'Marmot',
    description:
      'A messaging protocol for efficient E2E-encrypted group messaging, combining MLS with Nostr to protect content and metadata without phone/email.',
    site: 'https://github.com/parres-hq/marmot',
    repo: 'https://github.com/parres-hq/marmot',
    logo: '🦫',
    tags: ['Protocol', 'Encryption', 'Nostr'],
    source: 'foundry',
  },
  {
    id: 'foundry-zapstore',
    title: 'Zapstore',
    description:
      'The open app store powered by your social network. Cryptographically signed releases; pay developers directly in bitcoin with zero fees.',
    site: 'https://zapstore.dev',
    repo: 'https://github.com/zapstore/zapstore',
    logo: '/logos/zapstore.svg',
    logoBg: '#0f100f',
    tags: ['App Store', 'Nostr', 'Bitcoin'],
    source: 'foundry',
  },
  {
    id: 'foundry-ngit',
    title: 'ngit',
    description:
      'A decentralized GitHub alternative built on Nostr for code collaboration — issue tracking, pull requests, repository discovery via Nostr relays.',
    site: 'https://gitworkshop.dev',
    repo: 'https://github.com/DanConwayDev/ngit-cli',
    logo: '/logos/ngit.png',
    tags: ['Git', 'Nostr', 'Developer Tools'],
    source: 'foundry',
  },
];
