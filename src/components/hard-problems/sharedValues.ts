// "What brings us together" — an abstraction of the free-text answers people
// gave for why they feel aligned with And Other Stuff as a community / ethos.
//
// The twist vs. the other two infographics: this input is qualitative prose,
// not tags or locations. We classify each response (multi-label) into a small
// set of recurring *value themes* via transparent keyword rules, aggregate
// how often each value shows up, and surface a few real verbatim lines so the
// result keeps its human voice instead of reading as cold stats.
//
// Display-only flavor, kept local on purpose (the underlying responses are
// KV-only / never committed; these are paraphrase-safe excerpts only used to
// compute aggregate theme counts on the client).

export const RAW_RESPONSES: string[] = [
  `I would like to meet and develop self-sovereign software with fellow nerds.`,
  `AOS is a community with vision and common interest that could champion and thrive in building the coordination systems that I am envisioning.`,
  `The framing of "technology for human thriving" is the closest I've seen to how I feel about the work. I was invited by someone whose judgment I trust.`,
  `I'm working on Nostr and want to build community tech.`,
  `Gart is the other stuff on nostr.`,
  `C, C++, Rust, free software, distributed systems, security, cryptography`,
  `N/A`,
  `AOS creates spaces where projects/communities can learn from each other and build synergies. Together we can do so much!`,
  `AOS sits at the exact intersection of freedom tech and real-world field deployment that PawaVox is built for. Election observers across Africa are being blocked, discredited, and ignored because their evidence isn't verifiable fast enough. Nostr changes that. AOS is the right room to pressure-test whether that integration works at scale.`,
  `AOS is the perfect platform to showcase what Bitshala is building. A large part of building the technical talent pool is social, cultural, and educational. We wanna participate in AOS to learn from other builders and showcase what we have learned on our journey, so other communities and countries can start fostering their own Bitcoin FOSS communities. AOS also seems like the perfect platform to showcase Coinswap to the activist builder community and gather valuable feedback.`,
  `Fight's campaigns expose chokepoints and resist mandatory backdoors that break encryption, while promoting data privacy, the right to code and free culture, all of which create an environment where alternative models and technologies can flourish. Projects like the ones built by And Other Stuff rely upon teams like ours at Fight to ensure that the technologies they provide are not banned or sued out of existence. Our efforts champion the foundational values of openness and privacy that are intrinsic to these technologies.`,
  `I was invited. Honestly, I am new to AOS and want to learn more before claiming I understand the fit. From what I've understood so far, AOS and the First Person Project overlap in critical areas, particularly around web-of-trust primitives, portable identity, and keeping agency with people rather than platforms. I would like to come to Convergence to test that hypothesis. That's basically what draws me: an invitation I trust, curiosity, and looking forward to interesting conversations in the field.`,
  `I've been working on other stuff long before it was cool or an organization was named after it.`,
  `My work with Bread & Roses and the Spatial Web is fundamentally about designing open, interoperable systems of coordination, the kind that let people move from dependency to agency. I am building financial infrastructure that enables workers to own the systems they sustain, unlocking access to capital without extractive intermediaries. This is a new commons for coordination, where communities can define their own rules without centralized gatekeepers.`,
  `The work has been inspired and informed by holochain since the beginning. Built on atomic sovereignty it enables braided consensus multi scale interactions, communities and knowledge graphs related to global to local interests.`,
  `Can't unsee how important (and fun) the work y'all do is!`,
  `Derek Ross brought AOS Convergence to my attention.`,
  `I'm drawn to And Other Stuff because it is serious about open protocols, real users, and human agency - even when it doesn't make money yet - essentially technology that NEEDS to exist. I want to be in a room with people who are not only worried about centralization, but are actually shipping alternatives.`,
  `I would like to test my ideas and learn from other builders to strengthen the tech and make it more resilient. I have designed a decentralised oracle system that could be used by other apps like wallets and nostr apps. I would like to design with others the nip for that and develop an open standard so bao markets can operate on a protocol level even when the website is gone. This may become a substrate for decentralised research with contributors being both humans and LLMs.`,
  `The open and collaborative nature of the set-up is fascinating and I would like the opportunity to get up close to people and projects that I might not otherwise get to learn from. Getting to attend feels like it would be a once in a lifetime experience for me.`,
  `The individuals within and associated with And Other Stuff have been the most active in community organizing. The ecosystem survey they sent out signals clear alignment in helping Nostr and the broader ecosystem of freedom tech grow. I care to align with organizations that engage and accept feedback from our ecosystem of passionate developers and users.`,
  `I was invited by Derek Ross, to premiere our Nostr integrations. In Las Vegas 2026 we did our first Nostr zaps with Ark mainnet, and look to bring the technology to a wider audience.`,
  `I'm exploring how to build trust & safety tooling for open protocols without reintroducing centralized gatekeepers — specifically, threat detection for Nostr relay infrastructure. I want to validate a hypothesis: that we can build decentralized infrastructure monitoring as a shared, open resource rather than a proprietary intelligence product.`,
  `The focus on identity on the Internet and protocols and standards.`,
  `Nostr is NOT a social network. Nostr is a growing network of interconnected and independent social apps. Because of private keys and distributed relays, Nostr is the only social protocol that allows users to remain in control of their identities and content across apps. AOS celebrates the "other stuff" that this still nascent Nostr protocol promises. Together, we are taking Nostr to new heights. I'm all here for it.`,
  `The way AOS is structured, permissionless and multi-disciplinary, mirrors how I think the best open-source work gets done: people who care deeply, working in public, without waiting for permission. I've crossed paths with several of the projects through my research work with activists and Lightning wallet users.`,
  `Liz, Rabble, AOF (and other friends).`,
  `ngit is in the foundry and I also contribute to soapbox! Good things happen when we work together. It's easy to work in silos on nostr.`,
  `The people.`,
  `The framing of the work - Lab, Studio, Foundry and the commitment to "other stuff". I find that, more times than I would like to admit, I end up going into rabbit holes in the space of other stuff.`,
  `Liz and Rabble.`,
  `Bitcoin is freedom of money, Nostr is freedom of everything else. It provides self sovereign identity as opposed to centralized systems like domain names, TLS certs, IP addresses, phone numbers, email addresses etc.`,
  `Freedom tech and Bitcoin.`,
  `And Other Stuff matters to me because it sits at the intersection of freedom tech, community governance, and sustainable support structures. We fiscally host the AOS initiative through the Open Collective Europe Foundation. I'm interested in what it reveals about the infrastructure these ecosystems need in order to last, connecting conversations about technical freedom with the financial and organizational realities that make it possible.`,
  `Main motivation is ownership, using and building technology where I have the choice to move to a different provider.`,
  `I recently attended Sovereign Engineering where I met many developers working on different Nostr-related projects and I think it was really productive for finding out what is worth building and how to build it.`,
  `The question of how technology can support real life communities to thrive is keeping me awake. We work with a lot of people that are not 'into tech'. I want to do this in a responsible way. I simply want to be part of the conversation when new tech is built, as a user and community builder, not a coder.`,
  `We are huge fans of freedom tech and Nostr and are aligned that it's critical to grow the Nostr ecosystem beyond a Twitter clone. I think there is an opportunity to help dissidents attract audiences with AI-powered news aggregation, so authoritarian countries have an interface to keep up to date on uncensored news.`,
  `The ability to network.`,
  `The network and support through the Nostr dev community. Working with great minds.`,
  `As an independent freedom tech and FOSS dev I know there will be the right people to network with and share ideas, knowledge and wisdom with each other.`,
  `I love building freedom tech.`,
  `I like contributing to projects whose premise is to promote greater freedom and privacy on the internet.`,
  `Was told about this from Calle and I want to learn more about Marmot so I can integrate it into Sovran instead of using Nostr DMs.`,
  `Flotilla is part of the AOS family and this gathering seems to be the main in-person gathering of Nostr folks this year.`,
  `I believe we will benefit from working together in an intercommunal manner to build an internet that serves public interests. The AT network ecosystem will benefit from learning from other communities of practice, such as And Other Stuff.`,
  `I will be traveling to Oslo with my husband, who works at Soapbox. I'm interested in the themes and ideas around decentralized technologies and freedom tech, especially how they can intersect with healthcare.`,
  `Clarity of mission, caliber of people and delivery execution. I tell my kids that if you are the smartest person in the room, you are in the wrong room. I'd like to be the dumbest person in the &OS room.`,
  `Looking forward to meeting other builders who are building more than just social clients on top of the nostr protocol.`,
  `It's interesting to do what Bitcoin does for communication as well.`,
  `I'm really interested to know more about what people are building in and around AOS, after my conversation with a member who thinks my work is very aligned with what you are doing and invited me to attend.`,
  `Been invited to a mini hackathon in Switzerland last year. I know Rabble for a while. Met Jack once at the Khosla Summit in Sausalito.`,
  `I walked up to Liz and she said I should come and chat. Our group loves to collaborate and interoperate with all. We are community focused. We hope to support all the communities that have similar goals to us.`,
  `Your commitment to quality over quantity is really aligned with my own perspective, especially when it comes to freedom tech that must "just work" to compete against centralized solutions.`,
  `I'm drawn to And Other Stuff because it aligns with my mission of growing Nostr beyond being seen as just a Twitter alternative, and instead positioning it as a broader foundation for decentralized, human-centered tools. I was also encouraged to apply by Derek Ross, whose work I greatly respect.`,
  `Convergence! United we stand, divided we fall!`,
  `I'm part of the Soapbox team.`,
  `Calle introduced me to it. I truly enjoy the exchange with other people working in this space.`,
  `I have been introduced to the community through work on diVine, and am excited and impressed by the talent, commitment, and mission.`,
  `I'm interested in technology that empowers individual freedom, I want to meet like minded people and build new ideas.`,
  `For three years now I've been saying that the 'Other Stuff' of nostr is truly the most exciting, that nostr is more than Twitter alternatives. AOS is building the 'Other Stuff' of nostr and what will ultimately onboard the masses to this ecosystem.`,
  `I started building PocketVibe to make Nostr development more accessible, which led me to MKStack and Soapbox. We shared the same vision of lowering the barrier for builders on Nostr. Empowering communities, supporting activists, and making open systems practical for people who want to build their own futures. Permissionless play and exploring the "other stuff" is what brings me here.`,
  `I am drawn to And Other Stuff because it brings together people who are actively building real solutions at the intersection of technology, freedom, and society. I value spaces where ideas are not just discussed but tested and implemented, especially in challenging environments.`,
  `I'm really excited to meet like-minded people and communities who build and/or deploy radical and social good technologies in the world, and care about making positive impacts. I am looking to join the broader community of practice doing this work.`,
  `We understand the importance of censorship resistance protocols & privacy and the importance of bitcoin technical education in every corner of the world. We're building infrastructure to teach freedom tech in local languages.`,
  `Affinity to Freedom Tech.`,
  `That's all I do. We need this to be ready for the mainstream and have artists see what the possibilities are. I want this to be the standard of a truly independent artist.`,
  `I have been drawn to the organization's commitment to expanding digital agency and building tools that give individuals more control, privacy, and resilience in an increasingly fragile digital/irl environment. I have also followed projects like BitChat with interest.`,
  `I'm building freedom tech for free cities and communities, so I'm interested in apps and services that cover everything needed to run a society.`,
  `Need to hang out with other builders.`,
  `I'm a close collaborator of Rabble, Liz and Calle.`,
  `What draws me is the belief that open systems only remain meaningful if there are people capable of building, maintaining, and challenging them. Decentralization is not just a property of the protocol, but of the people contributing to it. I'm especially interested in how new coordination models, open protocols, and in-person collaboration can unlock forms of building that go beyond traditional institutions.`,
  `Team soapbox has been working closely with AOS. I have had an incredible opportunity to begin a deconstruction journey, with considerable censorship struggles in my outreach work. I have started to become educated on the mission AOS shares to fight back against many of the injustices we face.`,
  `I'd relish the opportunity to collaborate with others also working on technology that shares my ethos of privacy and sovereignty. Understanding where others focus in this broad ecosystem makes me a better contributor.`,
  `Building freedom tech tools.`,
  `I care about human freedom and bitcoin.`,
  `I like the people.`,
  `I'm drawn to AOS because I share its belief that open, permissionless tools can expand human freedom. Working on the Cashu Dev Kit gives me a way to add private, Bitcoin-backed e-cash to the projects that AOS develops, making them financially sovereign without relying on centralized services.`,
  `I believe nostr is the future of the internet, but there's much more that can be done with nostr than yet another kind 1 feed application. White Noise is already an AOS grant recipient. The ecosystem is full of organizations that celebrate the idea of freedom tech; AOS is one of the few that consistently bets on the builders actually doing it.`,
  `Because the team is the coolest.`,
  `Connecting with people worried about the same issues. People that believe that "bad" tech can be fixed with "good" tech, and want to make a change by building and showcasing these more positive alternatives.`,
  `The multi disciplinary aspect of bringing different technologies and people together to work on freedom tech and learn with each other.`,
  `nostr is an alternative internet not alternative twitter.`,
  `I am drawn to the ethos that fuels AOS's work. Specifically, I align with the organizational mission to make democracy advocates unstoppable and inevitable. I am inspired by projects like Bitchat that have spun out of the Foundry, revolutionizing the resilience and accessibility of communication channels.`,
  `I'm drawn to AOS because of what the name represents. Nostr's true success will come from being much more than just decentralized microblogging - a rich ecosystem of specialized apps that compound in power because they interoperate. I'm building my piece with the Rust backend for White Noise and the Marmot Protocol to solve private, unstoppable communication.`,
  `I am really bullish about Nostr and I think its success depends on people building other apps that are not twitter clones but novel things.`,
  `Mission-oriented and technically-minded individuals who are predisposed to building something new versus telling others what should be done. Commitment to individual freedom and maximizing human agency.`,
  `I'm part of AOS and have an HRF grant.`,
];

export type Value =
  | 'Freedom tech'
  | 'Self-sovereignty & agency'
  | 'Decentralization & open protocols'
  | 'Privacy & censorship-resistance'
  | "Beyond Twitter — Nostr's 'other stuff'"
  | 'Community & collaboration'
  | 'Bitcoin & sound money'
  | 'Real-world impact & human thriving';

interface ValueDef {
  value: Value;
  emoji: string;
  test: RegExp;
}

// Transparent keyword rules. A response can match several values (multi-label).
const VALUE_DEFS: ValueDef[] = [
  {
    value: 'Freedom tech',
    emoji: '🗽',
    test: /freedom tech|free software|free culture|right to code|individual freedom|human freedom|freedom and privacy|technology that empowers|freedom of (money|everything)/i,
  },
  {
    value: 'Self-sovereignty & agency',
    emoji: '🔑',
    test: /self-?sovereign|sovereignty|human agency|user agency|keeping agency|own the systems|ownership|portable identity|control of their identities|digital agency|maximizing human agency|move to a different provider|self sovereign identity/i,
  },
  {
    value: 'Decentralization & open protocols',
    emoji: '🕸️',
    test: /decentrali[sz]|permissionless|centralized gatekeepers|without centralized|open protocol|open standard|protocols and standards|interoperat|web-?of-?trust|distributed (system|relays)|coordination system|open systems/i,
  },
  {
    value: 'Privacy & censorship-resistance',
    emoji: '🛡️',
    test: /privacy|private|censorship|encryption|backdoor|surveillance|uncensored|unstoppable communication|trust & safety/i,
  },
  {
    value: "Beyond Twitter — Nostr's 'other stuff'",
    emoji: '✨',
    test: /other stuff|twitter (clone|alternative)|than (just |yet another )?(a )?twitter|alternative internet|kind 1|more than just|not a social network|microblogging|novel things|beyond a twitter/i,
  },
  {
    value: 'Community & collaboration',
    emoji: '🤝',
    test: /communit|collaborat|together|intercommunal|work(ing)? together|build synergies|united we stand|convergence|collective|community of practice|community focused|community organizing|network with|learn from (other|each)/i,
  },
  {
    value: 'Bitcoin & sound money',
    emoji: '₿',
    test: /bitcoin|lightning|cashu|e-?cash|\bzap|\bsats?\b|btc|coinswap|bitcoin-?backed/i,
  },
  {
    value: 'Real-world impact & human thriving',
    emoji: '🌱',
    test: /human thriving|thrive|real-?world|real life|social good|positive impact|democracy advocates|activist|dissident|field deployment|mainstream|onboard the masses|serves public interests|make a change|real users|real solutions/i,
  },
];

export interface ValueTally {
  value: Value;
  emoji: string;
  count: number;
}

export interface ValueStats {
  total: number; // substantive responses (noise filtered out)
  values: ValueTally[]; // ranked desc
  topValue: ValueTally;
  topValuePct: number;
  multiValueCount: number; // responses touching 3+ values
  quotes: string[]; // short verbatim lines that capture the ethos
}

// Drop non-answers / pure logistics so the aggregate reflects values, not noise.
const NOISE = /^(n\/a|the people\.?|liz and rabble\.?|liz, rabble.*|the ability to network\.?|because the team is the coolest\.?|i like the people\.?|i'm part of the soapbox team\.?|need to hang out with other builders\.?|c, c\+\+.*)$/i;

// Hand-picked short verbatim lines — the ethos in attendees' own words.
const QUOTES: string[] = [
  'Bitcoin is freedom of money, Nostr is freedom of everything else.',
  'Nostr is an alternative internet, not an alternative Twitter.',
  '"Bad" tech can be fixed with "good" tech.',
  'United we stand, divided we fall.',
  'Technology that NEEDS to exist.',
  "Keeping agency with people rather than platforms.",
  'If you are the smartest person in the room, you are in the wrong room.',
  'The closest framing I\'ve seen: technology for human thriving.',
];

export function computeValueStats(): ValueStats {
  const substantive = RAW_RESPONSES.filter((r) => !NOISE.test(r.trim()));

  const counts = new Map<Value, number>();
  let multi = 0;

  for (const r of substantive) {
    let hits = 0;
    for (const def of VALUE_DEFS) {
      if (def.test.test(r)) {
        counts.set(def.value, (counts.get(def.value) ?? 0) + 1);
        hits += 1;
      }
    }
    if (hits >= 3) multi += 1;
  }

  const values: ValueTally[] = VALUE_DEFS.map((d) => ({
    value: d.value,
    emoji: d.emoji,
    count: counts.get(d.value) ?? 0,
  })).sort((a, b) => b.count - a.count);

  const topValue = values[0];

  return {
    total: substantive.length,
    values,
    topValue,
    topValuePct: Math.round((topValue.count / substantive.length) * 100),
    multiValueCount: multi,
    quotes: QUOTES,
  };
}
