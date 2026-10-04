#!/usr/bin/env bash
# Adds sample events through the admin API, so the website has something to show.
#
# Usage (backend must be running):
#   cd event-booking-backend
#   source local.env.sh
#   ./scripts/seed-sample-events.sh
#
# Dates are relative to today, so the events are always upcoming.

set -euo pipefail

API="${API_URL:-http://localhost:8080}"
: "${ADMIN_EMAIL:?Run 'source local.env.sh' first}"
: "${ADMIN_PASSWORD:?Run 'source local.env.sh' first}"

# Log in as admin and pull the token out of {"token":"..."}
TOKEN=$(curl -sf -X POST "$API/api/auth/login" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}" \
  | sed -E 's/.*"token":"([^"]+)".*/\1/') || { echo "Admin login failed. Is the backend running?"; exit 1; }

# date N days from now at HH:MM → 2026-11-01T19:30:00
on() { date -d "+$1 days" "+%Y-%m-%dT$2:00"; }

create() {
  local title=$1 category=$2 location=$3 date=$4 tickets=$5 price=$6 description=$7
  local status
  status=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$API/api/admin/events" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d "{\"title\":\"$title\",\"category\":\"$category\",\"location\":\"$location\",\"eventDate\":\"$date\",\"totalTickets\":$tickets,\"price\":$price,\"description\":\"$description\"}")
  echo "$status  $title"
}

create "Neon Harbor Live"          CONCERT  "Brooklyn, NY" "$(on 13 20:00)" 400 45 "A four-band night of synth pop and post-punk at the waterfront hall. Doors at 7."
create "Founders & Coffee"         MEETUP   "Austin, TX"   "$(on 18 18:30)" 80  0  "An evening of quick pitches and open conversation with local startup founders, then coffee and questions."
create "Intro to Screen Printing"  WORKSHOP "Portland, OR" "$(on 34 10:00)" 16  85 "Hands-on morning class. All inks and two tote bags included."
create "Late Show: Stand-up Night" COMEDY   "Chicago, IL"  "$(on 41 21:30)" 120 25 "Five comics, one host, no phones on stage."
create "Designing for Trust"       TALK     "Brooklyn, NY" "$(on 59 19:00)" 200 15 "An evening talk on clear interfaces for money, health and booking flows."
create "Rooftop Jazz Session"      CONCERT  "Austin, TX"   "$(on 66 19:00)" 150 30 "Acoustic sets at sunset on the hotel rooftop."
create "Tech Meetup: Spring Boot"  MEETUP   "Pune, IN"     "$(on 24 18:00)" 60  0  "Lightning talks on Spring Boot, JPA and building APIs that don't oversell."
create "Pottery for Beginners"     WORKSHOP "Bengaluru, IN" "$(on 29 11:00)" 12 40 "Two hours on the wheel. Clay, glaze and firing included."

echo "Done. 201 = created."
