# Animation visual review evidence

These captures show real app components rendered in the local **browser fixture**, with explicit replacements for native services and SVG rendering. They are not screenshots or recordings from an Android or iOS phone.

- [Practical scenes](practical-scenes.jpg): all 18 practical steps, selected individually in Chromium at a 390 × 1000 viewport with Slovak text and reduced motion. The image shows each step's static final frame.
- [Animation library](library.png): the current Slovak library at a 390 × 1000 viewport in light mode.
- [CPR screen in dark mode](cpr-full-dark.png): the current full CPR route with the final AED step selected, including the training warning, emergency action, controls, step text, and source notice. The selected-step card uses a step Badge without a percentage; the playback timeline represents animation time.
- [Bag animation demo](bag-demo.gif): browser-fixture playback preview of the bag tutorial.
- [Locale review results](locales-review.json): the current library in all 21 supported locales at 320 px, alternating light and dark mode, plus the initial and final campfire and CPR steps in Arabic, English, and Slovak at 320 px.

No browser page errors, clipped scene objects, offscreen layers, or layer alignment defects were found across the 18 practical final frames. CPR hands overlap the central lower sternum marker; the AED scene shows bare chest and opposite upper/lower pad positions. Bleeding shows direct pressure; source inspection also confirmed that the hand remains planted during the continuous-pressure step. Burns cooling shows tap water and runoff. Campfire scenes show an outdoor stone ring, water bucket, small contained fire, and an extinguishing/stirring scene.

The current locale review covered 27 routes and 12 player states. It found zero page errors, zero document-width overflow states, and zero visible horizontal overflow elements after accounting for clipping and scrolling ancestors. The updated step Badge removes the earlier percentage/timeline presentation inconsistency. The animation-time disclaimer remains visible beneath the controls.

This review checks browser presentation only. It does not verify native device rendering, animation performance, real billing, or clinical accuracy.
