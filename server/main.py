from __future__ import annotations
from typing import overload, Any
import json
import random
import enum


# TODO decide if you need hand_add deck_add...
# and can just use it in discard, destroy...

class Action(enum.Enum):
    START_OF_TURN = 0
    END_OF_TURN = 1
    ACTIVATE = 2
    ENTER_STABLE = 3
    LEAVE_STABLE = 4


class Card:
    """
    sample action format:
    
    self.action = {
        "optional": true/false,
        Action.START_OF_TURN: [],
        Action.END_OF_TURN: [],
        Action.ACTIVATE:"action_phase":[],
        Action.ENTER_STABLE: [],
        Action.LEAVE_STABLE: []
    }
    # self.action = {
    #     "optional": true/false,
    #     "start_of_turn": [],
    #     "end_of_turn": [],
    #     "activate":"action_phase":[],
    #     "enter_stable": [],
    #     "leave_stable": []
    # }
    """

    def __init__(self, name: str, card_type: str, action: dict, text: str, game: Game):
        self.name: str = name
        self.card_type: str = card_type
        self.actions: dict = action
        self.text: str = text
        self.game = game

    # magic
    # unicorn
    # up/downgrade
    # instant
    def activate_card(self, player: Player, action_type):
        # first gets cards activations and finds context of action
        actions = self.actions[action_type]
        # match action_type:
        #     case Action.START_OF_TURN:
        #         actions = self.actions["start_of_turn"]
        #     case Action.END_OF_TURN:
        #         actions = self.actions["end_of_turn"]
        #     case Action.ACTIVATE:
        #         actions = self.actions["activate"]
        #     case Action.ENTER_STABLE:
        #         actions = self.actions["enter_stable"]
        #     case Action.LEAVE_STABLE:
        #         actions = self.actions["leave_stable"]
        #     case other:
        #         print("error: unknown case")
        # sends form to fulfill actions
        print("actions to do:", actions)
        if len(actions) != 0:
            """
            form example format
            if actions = ["discard", "sacrifice", "destroy", "draw", "steal", "trade"]
            
            form = [
                {"name": p1}, # discard
                {"name": p1}, # sacrifice
                {"name": p1}, # destroy
                {"name": p1}, # draw
                {"name": p1, "opp_name": p2, "opp_card_str": card1}, # steal
                {"name": p1, "card": card1}, # bring back
                {"name": p1, "opp_name": p2, "card": card2, "hand": true}, # trade
            ]
            """
            form = input("fill activation:")  # form should be a list
            # do actions (maybe be recursive)
            for act in zip(actions, form):
                if act[0]["optional"]:
                    if input("active card?[y/N] ") == "y":
                        continue
                match act[0]:
                    case "discard":
                        self.discard(act[1]["name"])
                    case "sacrifice":
                        self.sacrifice(act[1]["name"])
                    case "destroy":
                        self.destroy(act[1]["name"])
                    case "draw":
                        self.draw(act[1]["name"])
                    case "steal":
                        self.steal(act[1]["name"], act[1]["opp_name"], act[1]["opp_card_str"])
                    case "bring_back":
                        self.bring_back(act[1]["name"], act[1]["card"])
                    case "trade":
                        self.trade(act[1]["name"], act[1]["opp_name"], act[1]["card2"], act[1]["hand"])
                    case "choose":
                        self.choose(None)
                    case "ban":
                        self.ban()
                    case other:
                        print("error: unknown case")

        # determine type(magic uni, up/down) and handle accordingly
        match self.card_type:
            case "magic":
                pass
            case "magic unicorn":
                pass
            case "upgrade":
                pass
            case "downgrade":
                pass
            case "instant":
                pass

    # hand > discard
    def discard(self, name: Player):
        print("discarding", name, self.name)
        name.hand_remove(self)
        self.game.discard_pile.insert(0, self)

    # stable > discard
    def sacrifice(self, name: Player):
        print("sacrificing", name, self.name)
        name.stable_remove(self.name)
        self.game.discard_pile.insert(0, self)

    # opp stable > discard
    def destroy(self, name: Player):
        print("destroying", name, self.name)
        name.stable_remove(self.name)
        self.game.discard_pile.insert(0, self)

    # deck > hand
    def draw(self, name: Player):
        print(name, "draws")
        self.game.deck.pop(0)
        name.hand_add(self)

    # opp stable > hand
    def steal(self, name: Player, opp_name: Player, opp_card_str: str):
        print(name, "steal", opp_card_str, "from", opp_name)
        card = opp_name.stable_remove(opp_card_str)
        name.hand_add(card)

    # stable > hand
    def bring_back(self, name: Player, card: Card):
        print("bring back", name)
        name.return_to_hand(card.name)

    # hand > opp hand / stable
    def trade(self, name: Player, opp_name: Player, opp_card_str: str, hand: bool):
        if hand:
            print(name, "traded hands", self.name, "with", opp_name, "for", opp_card_str)
            name.hand_swap(self.name, opp_name, opp_card_str)
        else:
            print(name, "traded stable", self.name, "with", opp_name, "for", opp_card_str)
            name.hand_stable_swap(self.name, opp_name, opp_card_str)

    def choose(self, name: Player):
        pass

    def ban(self):
        pass


class Player:
    def __init__(self, username: str):
        self.username: str = username
        self.hand: dict[str:Card] = {}
        self.stable: dict[str:Card] = {}

    def hand_add(self, card: Card) -> None:
        self.hand[card.name] = card

    def stable_add(self, card: Card) -> None:
        self.stable[card.name] = card
        card.activate_card(self, Action.ENTER_STABLE)

    def hand_remove(self, card_str: str) -> Card:
        return self.hand.pop(card_str, None)

    def stable_remove(self, card_str: str) -> Card:
        card = self.stable.pop(card_str, None)
        card.activate_card(self, Action.LEAVE_STABLE)
        return card

    def tap_card(self, card_str: str) -> bool:
        card: Card = self.stable_find(card_str)
        if card:
            card.activate_card(self, Action.ACTIVATE)
            return True
        return False

    def play(self, card_str: str) -> bool:
        # card: Card = self.hand.pop(card_str, None)
        card = self.hand_remove(card_str)
        if card:
            # self.stable[card.name] = card
            # card.activate_card(card.name, self, "activate")
            self.stable_add(card)
            return True
        return False

    def return_to_hand(self, card_str: str) -> bool:
        # card = self.stable.pop(card_str, None)
        card = self.stable_remove(card_str)
        if card:
            # self.hand[card.name] = card
            # card.activate_card(card.name, self, "activate")
            self.hand_add(card)
            return True
        return False

    def hand_swap(self, card_str: str, other_player, opp_card_str: str) -> bool:
        # card = self.hand.pop(card_str, None)
        # opp_card = other_player.hand.pop(opp_card_str, None)
        card = self.hand_remove(card_str)
        opp_card = other_player.hand_remove(opp_card_str)
        if card and opp_card:
            # self.hand[opp_card.name] = opp_card
            # other_player.hand[card.name] = card
            self.hand_add(opp_card)
            other_player.hand_add(card)
            return True
        return False

    def stable_swap(self, card_str: str, other_player, opp_card_str: str) -> bool:
        card = self.stable_remove(card_str)
        opp_card = other_player.stable_remove(opp_card_str)
        if card and opp_card:
            # self.stable[opp_card.name] = opp_card
            # other_player.stable[card.name] = card
            self.stable_add(opp_card)
            other_player.stable_add(card)
            return True
        return False

    def hand_stable_swap(self, card_str: str, other_player, opp_card_str: str) -> bool:
        card = self.hand_remove(card_str)
        opp_card = other_player.stable_remove(opp_card_str)
        if card and opp_card:
            # self.hand[opp_card.name] = opp_card
            # other_player.stable[card.name] = card
            self.hand_add(opp_card)
            other_player.stable_add(card)
            return True
        return False

    def stable_hand_swap(self, card_str: str, other_player, opp_card_str: str) -> bool:
        card = self.stable_remove(card_str)
        opp_card = other_player.hand_remove(opp_card_str)
        if card and opp_card:
            # self.stable[opp_card.name] = opp_card
            # other_player.hand[card.name] = card
            self.stable_add(opp_card)
            other_player.hand_add(card)
            return True
        return False

    def run_start_of_turn(self):
        for card_str in self.stable:
            card: Card = self.stable[card_str]
            if len(card.actions[Action.START_OF_TURN]) != 0:
                card.activate_card(self, Action.START_OF_TURN)

    def run_end_of_turn(self):
        for card_str in self.stable:
            card: Card = self.stable[card_str]
            if len(card.actions[Action.END_OF_TURN]) != 0:
                card.activate_card(self, Action.END_OF_TURN)

    def hand_find(self, card_str: str) -> Any | None:
        if card_str in self.hand:
            return self.hand[card_str]
        return None

    def stable_find(self, card_str: str) -> Any | None:
        if card_str in self.stable:
            return self.stable[card_str]
        return None


class Game:
    def __init__(self, players: list[Player] = None):
        if players is None:
            players = []
        self.deck: list[Card] = []
        self.discard_pile: list[Card] = []
        self.nursery: list[Card] = []
        self.players: list[Player] = players
        self.turn: int = 0
        self.all_cards = dict()  # dict of all card str to card obj

    # Note: since there are multiple of the same card they are indexed
    def read_json(self):
        f = open('data.json')
        data = json.load(f)
        for i in data:
            for j in range(int(i['quantity'])):
                # convert json action to Action enum
                act = dict()
                act[Action.START_OF_TURN] = i['action']["start_of_turn"]
                act[Action.END_OF_TURN] = i['action']["end_of_turn"]
                act[Action.ACTIVATE] = i['action']["activate"]
                act[Action.ENTER_STABLE] = i['action']["enter_stable"]
                act[Action.LEAVE_STABLE] = i['action']["leave_stable"]

                #                   same cards are indexed here
                #                               v
                card: Card = Card(i['name'] + str(j), i['type'], act, i['text'], self)
                self.deck.append(card)
                self.all_cards[card.name] = card
        f.close()

    def add_player(self, player: Player):
        self.players.append(player)

    def remove_players(self, player: Player):
        self.players.remove(player)

    def setup(self):
        for p in self.players:
            for i in range(5):
                p.hand_add(self.deck.pop(0))

    def shuffle(self):
        random.shuffle(self.deck)

    def draw_from_deck(self) -> Card | None:
        if len(self.deck) != 0:
            return self.deck.pop(0)
        return None

    def take_from_deck(self, card_str: str) -> Card | None:
        card = self.deck_find(card_str)
        if card is not None:
            return self.deck.remove(card)
        return None

    def draw_from_discard(self) -> Card | None:
        if len(self.discard_pile) != 0:
            return self.discard_pile.pop(0)
        return None

    def take_from_discard(self, card_str: str) -> Card | None:
        card = self.discard_find(card_str)
        if card is not None:
            self.discard_pile.remove(card)
            return card
        return None

    def deck_find(self, card_str: str) -> Card | None:
        if card_str in self.all_cards:  # TODO fix
            card_obj = self.all_cards[card_str]
            if card_obj in set(self.deck):
                return card_obj
        return None

    def discard_find(self, card_str: str) -> Card | None:
        if card_str in self.all_cards:  # TODO fix
            card_obj = self.all_cards[card_str]
            if card_obj in set(self.discard_pile):
                return card_obj
        return None

    def run_start_of_turn(self):
        self.get_turn().run_start_of_turn()

    def run_end_of_turn(self):
        self.get_turn().run_end_of_turn()

    def win_condition(self) -> Player | None:
        for p in self.players:
            if len(p.stable) >= 7:
                return p
        return None

    def rotate_turn(self):
        self.turn += 1

    def get_turn(self) -> Player:
        if len(self.players) != 0:
            return self.players[self.turn % len(self.players)]


if __name__ == '__main__':
    game: Game = Game()
    p0: Player = Player("p0")
    p1: Player = Player("p1")
    p2: Player = Player("p2")
    p3: Player = Player("p3")

    game.add_player(p0)
    game.add_player(p1)
    game.add_player(p2)
    game.add_player(p3)
    # TODO everyone chooses a bb unicorn
    game.setup()
    while 1:  # main game loop
        player_turn: Player = game.get_turn()
        print("=============(turn: ", game.turn, ")==============================")
        print("==", player_turn.username, "'s turn==")

        # ========================= start of turn======================================================================
        print("==start of turn phase==")
        game.run_start_of_turn()
        if input("active any cards?[y/n]") == "y":
            while 1:
                player_turn.tap_card(input("active any cards?[1...n]"))
                if input("done?[y/n]") == "y":
                    break

        # ========================= draw phase ========================================================================
        print("==draw phase==")
        player_turn.hand_add(game.draw_from_deck())

        # ========================= draw or phase======================================================================
        print("==draw or play phase==")
        if input("draw or play[p/d]") == "p":
            player_turn.play(input("play what?[1...n]"))
            # activate any other cards
            if input("active any other cards?[y/n]") == "y":
                while 1:
                    player_turn.tap_card(input("activate which card?"))
                    if input("done?[y/n]") == "y":
                        break
        else:
            player_turn.hand_add(game.draw_from_deck())

        # ========================= end of turn =======================================================================
        print("==end of turn phase==")
        game.run_end_of_turn()

        # check if hand > 7
        if len(player_turn.hand) > 7:
            for i in range(len(player_turn.hand) - 7):
                card_name = input("discard:")
                player_turn.hand_remove(card_name)

        check_win = game.win_condition()
        if check_win is not None:
            print(check_win.username, "won!!!")
            break
        game.rotate_turn()
