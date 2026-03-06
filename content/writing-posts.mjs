const writingPosts = [
  {
    title: "AI-generated Bermanisms",
    slug: "ai_generated_bermanisms",
    importance: 60,
    metaDescription: `Jared "Take A Load" Goff or Jared "Turn Your Head and" Goff?`,
    homeSubtitleHtml: `Jared "Take A Load" Goff --or--<br />Jared "Turn Your Head and" Goff?`,
    archiveSubtitleHtml: `Jared "Take A Load" Goff --or--<br />Jared "Turn Your Head and" Goff?`,
    sections: [
      {
        delay: "delay-1",
        headerTitle: "AI-generated Bermanisms",
        html: ``,
      },
      {
        delay: "delay-2",
        html: `<img
  src="./assets/Berman.png"
  alt="Chris Berman"
  style="width: 25%; height: auto; border-radius: 12px; margin: 0 auto 1rem; display: block"
/>
<p>
  I started experimenting with LLMs in 2021, when I signed up for an OpenAI API key and
  began testing early GPT models like <code>davinci</code> and <code>babbage</code>.
  Since then, I have been using one benchmark on every new model that I can access:
  <strong>Can the AI produce good Bermanisms?</strong>
</p>
<p>
  If you are not familiar,
  <a href="https://en.wikipedia.org/wiki/Chris_Berman" target="_blank" rel="noreferrer">
    Chris "Boomer" Berman
  </a>
  is a sportscaster who has been on ESPN since 1979. He is known for many things, but
  one of his most iconic contributions to American culture is the pun-based nicknames
  that he gives to professional athletes. The nickname never has anything to do with the
  sport or any characteristics of the athlete. It's all about the chuckle.
</p>
<p>Here are some of my all-time favorite Berman-generated Bermanisms:</p>
<table style="width: 100%; border-collapse: collapse">
  <thead>
    <tr>
      <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 2px 4px">
        Bermanism
      </th>
      <th style="text-align: left; border-bottom: 1px solid #ddd; padding: 2px 4px">
        League
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Jeff "Brown Paper" Bagwell
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">MLB</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Steve "Dorsal" Finley
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">MLB</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Bert "Be Home" Blyleven
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">MLB</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Ben "Winter" Coates
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">NFL</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Carlos "1 if by Sea, 2 if by Land, 3 if" Baerga
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">MLB</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Scott "Supercalifragalisticexpliala" Brosius
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">MLB</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Andre "Bad Moon" Rison
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">NFL</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Vince Workman "My Way Back to You Babe"
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">NFL</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Sammy "Say it Ain't" Sosa
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">MLB</td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Roberto "Remember the " Alomar
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">MLB</td>
    </tr>
    <tr>
      <td style="padding: 2px 4px">Bernard "Innocent until proven" Gilkey</td>
      <td style="padding: 2px 4px">MLB</td>
    </tr>
  </tbody>
</table>
<p>
  I've been very impressed with many AI-generated language tasks that LLMs have produced
  in recent years, especially creative tasks like writing lyrics for songs and poetry.
  But it's been really bad at Bermanisms.
</p>
<p>Here is the prompt I've been using:</p>
<p>
  <em>
    Do you know what Bermanisms are? Here are some examples:<br />
    Jeff "Brown Paper" Bagwell<br />
    Mike Carreon "My Wayward Sun"<br />
    Steve "Dorsal" Finley<br />
    Bernard "Innocent until proven" Gilkey<br />
    Darryl "Green Eggs &amp;" Hamilton<br />
    Jeff Conine "The Barbarian"<br />
    Carlos "1 if by Sea, 2 if by Land, 3 if" Baerga<br />
    Roberto "Remember the " Alomar<br />
    Jeff "See Through" Blauser<br />
    Scott "Supercalifragalisticexpliala" Brosius<br />
    Sammy "Say it Ain't" Sosa<br />
    Eddie "Eat Drink &amp; Be" Murray<br />
    Bert "Be Home" Blyleven<br />
    Ben "Winter" Coates<br />
    Mike "You're in Good Hands with" Alstott<br />
    Jake "Daylight come and I wanna" Delhomme<br />
    Andre "Bad Moon" Rison<br />
    Vince Workman "My Way Back to You Babe"<br />
    Jeff "Philadelphia" Feagles<br />
    <br />
    I want to see if you can creat some original Bermanisms. Come up with 40 original
    Bermanisms for current NFL players. Every time you generate one, go back and compare
    it to the examples I have given and verify that it is a legitimate Bermanism. No
    need to explain the logic, just list 40 Bermanisms without numbering or bullets.
  </em>
</p>
<p>
  ChatGPT 5.2 (Thinking) is horrible at this task. Here are some examples of its output:
</p>
<table style="width: 100%; border-collapse: collapse">
  <tbody>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Patrick “Mahomes Is Where the Heart Is” Mahomes
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Josh “Allen Town” Allen
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Lamar “La-Mar-a-Lago” Jackson
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Joe “Burrow My Sunshine” Burrow
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Jalen “Hurts So Good” Hurts
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Christian “McCaffreeyoncé” McCaffrey
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Tyreek “Hill Street Blues” Hill
      </td>
    </tr>
    <tr>
      <td style="padding: 2px 4px">Travis “Kelce Lately” Kelce</td>
    </tr>
  </tbody>
</table>
<p>
  As you can see, these are bad. Some of them are clever, but they don't follow the logic
  of the many-shots (examples) that I provided. This is typical of LLM output over the
  years. But I always knew that it was possible for models to do better; that it was a
  matter of time before models could produce genuine Bermanisms.
</p>
<p>
  Enter Anthropic's Opus 4.6 (released February 5, 2026). Here is it's response to my
  prompt:
</p>
<table style="width: 100%; border-collapse: collapse">
  <tbody>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Jalen "Love" Hurts
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        CeeDee "Silence of the" Lamb
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        TJ "Kilo" Watt
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Patrick "My Old Kentucky" Mahomes
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Ja'Marr "Cut to the" Chase
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Tyreek "Over the" Hill
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Cooper "Stanley" Kupp
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        George "A Fine" Kittle
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Davante "Gomez &amp;" Adams
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Kirk "Kissin'" Cousins
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Jared "Blast" Goff
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Breece "Deck the" Hall
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Trey "Here Comes the" McBride
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Maxx "Bing" Crosby
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Derrick "O." Henry
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Lamar "Action" Jackson
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Kyle "Alexander" Hamilton
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Jayden "Jack" Daniels
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Malik "Good" Nabers
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Mark "St." Andrews
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Brock "Sit Up and Look" Purdy
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Jordan "What is" Love
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Deebo "Uncle" Samuel
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Saquon "Charles" Barkley
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Kenneth "Johnnie" Walker
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Justin "George" Jefferson
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Drake "Jack" London
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Joe "Down the Rabbit" Burrow
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Fred "Bros." Warner
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Nico "Tom" Collins
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Zack "A Rolling Stone Gathers No" Moss
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Pat "That's for" Surtain
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Sauce "Madison Square" Gardner
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Chuba "Old Mother" Hubbard
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Rachaad "Snow" White
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Tyler "Davy Jones'" Lockett
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        Jerry "Judge" Jeudy
      </td>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px; width: 50%">
        D'Andre "Taylor" Swift
      </td>
    </tr>
    <tr>
      <td style="padding: 2px 4px; width: 50%">Amari "Mini" Cooper</td>
      <td style="padding: 2px 4px; width: 50%">James "Captain" Cook</td>
    </tr>
  </tbody>
</table>
<p>
  These are much better. A lot of them are not good, but many of them genuinely made me
  laugh, as any good Bermanism should. I really loved
  <strong>Sauce "Madison Square" Gardner!</strong> Here are some more Opus gems that
  I've come across in other sessions:
</p>
<table style="width: 100%; border-collapse: collapse">
  <tbody>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Zay "April Showers Bring May" Flowers
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Cooper "Fill My" Kupp
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Jordan "Whole Lotta" Love
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Aidan "Starsky &amp;" Hutchinson
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Tank "Farmer in the" Dell
      </td>
    </tr>
    <tr>
      <td style="padding: 2px 4px">Brock "She Sure Looks" Purdy</td>
    </tr>
  </tbody>
</table>
<p>
  Next up is the latest major model to be released, Google Gemini 3.1 Pro (February 19,
  2026). Gemini 3.1 Pro does somethings better than any other model, but one thing it
  can't do is freaking count (or at least follow instructions). It repeatedly fails to
  produce 40 Bermanisms (Opus had no trouble doing this). Anyway here are the "40"
  Bermanisms it produced in the latest run:
</p>
<table style="width: 100%; border-collapse: collapse">
  <tbody>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Patrick "Take Me" Mahomes
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Joe "Beg, Steal, or" Burrow
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        C.J. "Two's Company, Three's a" Stroud
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Lamar "I'm Sorry Ms." Jackson
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Josh "Up and" Allen
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Justin "Movin' On Up" Jefferson
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        CeeDee "Mary Had a Little" Lamb
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Tyreek "Over the" Hill
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Breece "Deck the" Hall
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        De'Von "Ball and" Achane
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        D'Andre "Tailor" Swift
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Cooper "Half Full" Kupp
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Jared "Shake It" Goff
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        T.J. "Turn Down For" Watt
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Myles "To Go Before I Sleep" Garrett
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Fred "Pop" Warner
      </td>
    </tr>
    <tr>
      <td style="padding: 2px 4px">Aidan "Starsky and" Hutchinson</td>
    </tr>
  </tbody>
</table>
<p>
  I haven't been seeing a lot of overlap in the outputs, but Opus and Gemini 3.1 Pro
  consistently produce <em>Aidan "Starsky and" Hutchinson</em>. Of these Gemini
  Bermanisms, my favorite is
  <strong>C.J. "Two's Company, Three's a" Stroud</strong>. I also really like
  <strong>Myles "To Go Before I Sleep" Garrett</strong>. Here are some other Bermanisms
  from previous sessions with Gemini 3.1 Pro that made me laugh:
</p>
<table style="width: 100%; border-collapse: collapse">
  <tbody>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Brock "I Feel" Purdy
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Chris "Extra Virgin" Olave
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Cooper "Peanut Butter" Kupp
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Jalen "Everybody" Hurts
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        George "Slim" Pickens
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Saquon "All Bite No" Barkley
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Patrick "Lights Are On But Nobody's" Mahomes
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Jared "Take a Load" Goff
      </td>
    </tr>
    <tr>
      <td style="border-bottom: 1px solid #eee; padding: 2px 4px">
        Jared "Turn Your Head and" Goff
      </td>
    </tr>
    <tr>
      <td style="padding: 2px 4px">Kyle "Bottomless" Pitts</td>
    </tr>
  </tbody>
</table>
<p>
  I don't hold it against the models that they still have so many misfires. I'm sure
  Berman (and his writers) toss plenty of potential Bermanisms in the waste paper basket
  and we only see the cream of the crop on TV.
</p>
<p>
  I'll follow up this post with new experiments when the next generation of models is
  released (at this rate, probably next week!).
</p>
<p>
  One last note on the topic of Bermanisms. I have a friend that is very good at creating
  Bermanisms and likes to create them for many of his work colleagues. So if you would
  like to be as unpopular as this guy is around the office, I suggest that you try using
  an LLM to Bermanize people at your workplace!
</p>`,
      }
    ],
  },
  {
    title: "Sol LeWitt",
    slug: "sol_lewitt",
    importance: 50,
    metaDescription: `I'm really into the conceptual artist, Sol LeWitt.`,
    homeSubtitleHtml: `I'm really into the conceptual artist, Sol Lewitt.`,
    archiveSubtitleHtml: `I'm really into the conceptual artist, Sol Lewitt.`,
    sections: [
      {
        delay: "delay-1",
        headerTitle: "Sol LeWitt",
        html: `<p>I'm really into the conceptual artist, Sol LeWitt.</p>`,
      },
      {
        delay: "delay-2",
        html: `<p>
  I was never interested in art until around 2010, when I first discovered Sol LeWitt. I
  was visiting my Dad in Beacon, NY and had some time to kill. I decided to go to
  <a href="https://www.diaart.org/visit/visit-our-locations-sites/dia-beacon-beacon-united-states" target="_blank" rel="noreferrer">
    Dia Beacon,
  </a>
  a modern art museum built in 2003 that transformed Beacon into a significant arts
  community. At the time they had a large
  <a href="https://diaart.org/program/past-programs/sol-lewitt-drawing-series-exhibition/page/31/year/2007" target="_blank" rel="noreferrer">
    exhibition
  </a>
  of LeWitt’s Wall Drawings. I was blown away by scale of these massive works of art. For
  example,
  <a href="https://massmoca.org/event/walldrawing1211/" target="_blank" rel="noreferrer">
    Wall Drawing #1211
  </a>
  is 192 drawings laid out in a 4 x 48 grid, each one a square meter in size, so this
  one work of art is around 5 meters tall and 50 meters wide (allowing for white space on
  the borders)! Something about the algorithmic, non-arbitrary design of all the pieces
  spoke to me. Afterward, I started researching LeWitt and learned that he had just
  passed away in 2007. And I learned about
  <a href="https://www.tate.org.uk/art/art-terms/c/conceptual-art" target="_blank" rel="noreferrer">
    conceptual art
  </a>,
  a movement LeWitt helped popularize in the 1960s.
</p>
<p>
  One key aspect of conceptual art is that the idea behind the artwork is primary and
  that the execution of the artwork is perfunctory. As an example, the
  <a href="./assets/lewitt, sol, drawing series.pdf" target="_blank" rel="noreferrer">
    Wall Drawings
  </a>
  at Dia Beacon that I referred to earlier, were executed by two teams of assistants
  under LeWitts direction, but LeWitt did not do any of the physical work himself. More
  interestingly, if you purchase a Sol LeWitt Wall Drawing (
  <a href="https://www.sothebys.com/en/auctions/ecatalogue/2018/contemporary-art-day-sale-n09933/lot.109.html" target="_blank" rel="noreferrer">
    it will cost you anywhere from $150K to $1M+
  </a>
  ), what you actually get is a <em>Ceritificate of Authenticity and Diagram</em>. This
  gives you the exclusive right to have the work installed by a master craftsman (sold
  separately) on any one wall that you own or have permission to install on. If you have
  it installed on your living room wall and then sell the piece to someone else, you need
  to uninstall it before the new owner installs it on the wall of their choosing.
</p>
<p>
  MASS MoCA in North Adams, MA has one of the more incredible art exhibitions on the
  planet. They have 105 massive LeWitt Wall Drawings in a 27,000 sq ft building.
  <a href="https://massmoca.org/sol-lewitt/" target="_blank" rel="noreferrer">
    Sol LeWitt: A Wall Drawing Retrospective
  </a>
  was opened in 2008 and is scheduled to stay at MASS MoCA until the year 2043(!).
</p>`,
      },
      {
        delay: "delay-3",
        html: `<p class="media-caption">
  Composite Series (1970.01), Set of 5 silkscreens, Edition of 150, Sarah Lawrence
  Press.
</p>
<a
  href="https://www.sollewittprints.org/artwork/lewitt-raisonne-1970-01/"
  target="_blank"
  rel="noreferrer"
>
  <img
    src="./assets/sol_lewitt_Composite_Series_1971.png"
    alt="Sol LeWitt Composite Series 1971"
    style="width: 100%; height: auto; border-radius: 12px"
  />
</a>`,
      },
      {
        extraClasses: ["panel-narrow"],
        html: `<p class="media-caption">
  All One, Two, Three, and Four Part Combinations of Lines in Four Directions and Four
  Colors, Each Within a Square (1983.10), Silkscreen, Edition of 100, The Paris Review.
</p>
<a
  href="https://www.sollewittprints.org/artwork/lewitt-raisonne-1983-10/"
  target="_blank"
  rel="noreferrer"
>
  <img
    src="./assets/sol_lewitt_Paris_Review_1983.png"
    alt="Sol LeWitt Paris Review 1983"
    style="width: 100%; height: auto; border-radius: 12px; display: block"
  />
</a>`,
      },
      {
        headerTitle: "Sol LeWitt Links",
        html: `<ul class="subtitle-list">
  <li>
    <a href="https://massmoca.org/sol-lewitt/" target="_blank" rel="noreferrer">
      Sol LeWitt: A Wall Drawing Retrospective
    </a>
  </li>
  <li>
    <a href="https://www.sollewittprints.org/" target="_blank" rel="noreferrer">
      Sol LeWitt Prints Catalogue Raisonne
    </a>
  </li>
  <li>
    <a
      href="https://diaart.org/visit/visit-our-locations-sites/dia-beacon-beacon-united-states"
      target="_blank"
      rel="noreferrer"
    >
      Dia Beacon
    </a>
  </li>
  <li>
    <a
      href="https://www.amygoodchild.com/blog/midjourney-sol-lewitt"
      target="_blank"
      rel="noreferrer"
    >
      Midjourney takes on Sol LeWitt's Wall Drawings
    </a>
  </li>
  <li>
    <a href="https://youtu.be/UNbOVR4kw4U" target="_blank" rel="noreferrer">
      Conversation, Sol LeWitt Wall Drawings: Maintaining a Legacy
    </a>
  </li>
</ul>`,
      },
      {
        headerTitle: "All Non-Empty Combinations of Four Animations",
        headerLinkLabel: "Open in p5 Editor",
        headerLinkHref: "https://editor.p5js.org/millxing/sketches/4F7tdPL3Y",
        html: `<p class="media-caption">
  A p5.js sketch I made inspired by Lewitt's Paris Review and Composite Series works.
  <br />
  <br />
  Click anywhere on the sketch and press the 'h' key to customize the parameters of the
  sketch. <br />
  Press 'h' again to go back to the canvas.
  <br />
</p>
<iframe
  src="https://editor.p5js.org/millxing/full/4F7tdPL3Y"
  title="All Non-Empty Combinations of Four Animations p5.js sketch"
  loading="lazy"
  allowfullscreen
  style="width: 100%; min-height: 72vh; border: 0; border-radius: 12px; background: #ffffff"
></iframe>`,
      }
    ],
  },
  {
    title: "Legal Realignment at the Supreme Court",
    slug: "warren",
    importance: 25,
    metaDescription: `Harvard Law Professor Richard M. Re argues that legal ideologies are not permanently tied to either judicial constraint or judicial discretion.`,
    homeSubtitleHtml: `Richard M. Re argues that legal ideologies are not permanently tied to either judicial constraint or judicial discretion.`,
    archiveSubtitleHtml: `Richard M. Re argues that legal ideologies are not permanently tied to either judicial constraint or judicial discretion, and that those commitments shift with who holds power on the Court.`,
    archiveSubtitleClass: "warren-subtitle",
    sections: [
      {
        delay: "delay-1",
        headerTitle: "Legal Realignment at the Supreme Court",
        html: `<p class="media-caption">March, 2026</p>
<p style="text-align: left">
  Harvard Law Professor Richard M. Re has a really interesting thesis about the Supreme
  Court. His claim is that legal ideologies are not permanently connected to the
  principles of "constraint" (formalism, textualism, strict rules) or "discretion"
  (flexibility, purposivism, judicial empowerment). The side in power favors judicial
  discretion because it gives them the flexibility to implement the partisan agenda they
  favor. The side out of power favors judicial constraint because it limits the power of
  the majority. His papers
  <a href="https://lawreview.uchicago.edu/print-archive/legal-realignment" target="_blank" rel="noreferrer">
    Legal Realignment
  </a>
  (2024) and
  <a href="https://harvardlawreview.org/print/vol-139/to-a-conservative-warren-court/" target="_blank" rel="noreferrer">
    Foreword: To A Conservative Warren Court
  </a>
  (2025) explore this idea in depth and analyze it in the context of today's Supreme
  Court.
</p>
<p style="text-align: left">
  As an untrained, casual observer of the Supreme Court, I was always confused by the
  legal philosophies supposedly underlying Supreme Court decisions. It just seemed that
  principled adherence to those philosophies should result in more opinions that go
  against the partisan leanings of the justices.
</p>`,
      },
      {
        delay: "delay-2",
        html: `<img
  src="./assets/RE_X_2026-03-03.png"
  alt="Update 2026-03-02: Mirabelli v. Bonta"
  loading="lazy"
  style="width: 100%; height: auto; border: 0; border-radius: 12px; background: #ffffff"
/>
<p style="text-align: left">
  Update 2026-03-02: The Supreme Court vacated a U.S. Appeals Court stay (9th Circuit)
  in Mirabelli v. Bonta. This ruling reinstates a federal district court ruling that
  prohibits California schools from concealing a child's gender presentation from their
  parents and requires the schools to follow parental instruction regarding the names and
  pronouns that their children use.
</p>
<p style="text-align: left">
  This ruling is consistent with Re's thesis of legal realignment in that conservatives
  are basing the ruling in part on "substantve due process", specifically in Barrett's
  concurrence (joined by Roberts and Kavanaugh). The conservatives usually argue that
  judges shouldn't find "unexpressed rights" in the Constitution (the basis for
  overturning Roe. v. Wade). In this case, they were OK with protecting the unexpressed
  rights of parents.
</p>`,
      },
      {
        delay: "delay-3",
        headerLinkLabel: "Open Legal Realignment (2024) PDF",
        headerLinkHref: "./assets/legal_realignment.pdf",
        html: `<iframe
  src="./assets/legal_realignment.pdf"
  title="Legal Realignment PDF"
  loading="lazy"
  style="width: 100%; min-height: 80vh; border: 0; border-radius: 12px; background: #ffffff"
></iframe>`,
      },
      {
        delay: "delay-4",
        html: `<p>
  This Advisory Opinions podcast features an interview with Richard Re about his
  Conservative Warren Court essay. Re's latest paper analogizes today's Supreme Court
  with the Warren Court, in that they both had a durable ideologically aligned majority
  acting as a "corrective force" to reshape American society and overturn long-standing
  precedents.
</p>
<iframe
  data-testid="embed-iframe"
  style="border-radius: 12px"
  src="https://open.spotify.com/embed/episode/7Jlz55uj6BZ7khnFMf4UYX?utm_source=generator"
  width="100%"
  height="352"
  frameborder="0"
  allowfullscreen
  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
  loading="lazy"
></iframe>`,
      },
      {
        delay: "delay-5",
        headerLinkLabel: "Open Foreword: To A Conservative Warren Court (2025) PDF",
        headerLinkHref: "./assets/conserv_warren_court.pdf",
        html: `<iframe
  src="./assets/conserv_warren_court.pdf"
  title="Foreword: To A Conservative Warren Court PDF"
  loading="lazy"
  style="width: 100%; min-height: 80vh; border: 0; border-radius: 12px; background: #ffffff"
></iframe>`,
      }
    ],
  }
];

export default writingPosts;
