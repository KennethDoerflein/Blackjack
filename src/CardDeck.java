// Doerflein 2022
import java.util.ArrayList;
public class CardDeck {
  
  private ArrayList<Card> cards;
  private int size;
  private static final String[] RANKS =
 
        {"ace", "2", "3", "4", "5", "6", "7", "8", "9", "10", "jack", "queen", "king"};
  private int index = 0;
  
    private static final String[] SUITS =
        {"spades", "hearts", "diamonds", "clubs"};

    private static final int[] POINT_VALUES =
        {11, 2, 3, 4, 5, 6, 7, 8, 9, 10,10,10,10};
  public CardDeck() {
        cards = new ArrayList<Card>();
        for (int j = 0; j < RANKS.length; j++) {
            for (String suitString : SUITS) {
                String imageName = RANKS[j] + "_of_" +suitString + ".png";
                cards.add(new Card(RANKS[j], suitString, POINT_VALUES[j], imageName));
            }
        }
        size=cards.size();
        shuffle();
        shuffle();
        shuffle();
        shuffle();
        
  }
  
  public void shuffle() {
        for(int shuff = 0; shuff < 10; shuff++) {
            for (int j = cards.size() - 1; j >= 0; j--) {
                int rand = (int) (Math.random() * j);
                Card temp = cards.get(j);
                cards.set(j, cards.get(rand));
                cards.set(rand, temp);
            }
        }
        
    }
    
    public void redo() {
        
        cards.clear();
        for (int j = 0; j < RANKS.length; j++) {
            for (String suitString : SUITS) {
                String imageName = RANKS[j] + "_of_" +suitString + ".png";
                cards.add(new Card(RANKS[j], suitString, POINT_VALUES[j], imageName));
            }
        }
        size=cards.size();
        shuffle();
        shuffle();
        shuffle();
        shuffle();
        
    }
    
  public int getSize(){
      return cards.size();
    }
    
  public Card getCard(){
       //System.out.println("INDEX " + index);
       //System.out.println("SIZE" + cards.size());
       int rand = (int)(Math.random()*cards.size());
       Card temp = cards.get(rand);
       cards.remove(rand);
       index++;
       return temp;
     
    }
  public boolean isEmpty() {
		return cards.size() == 0;
	}

  
  public String toString() {
        String rtn = "size = " + size + "\nUndealt cards: \n";

        for (int k = size - 1; k >= 0; k--) {
            rtn = rtn + cards.get(k);
            if (k != 0) {
                rtn = rtn + ", ";
            }
            if ((size - k) % 2 == 0) {

                rtn = rtn + "\n";
            }
        }

        rtn = rtn + "\nDealt cards: \n";
        for (int k = cards.size() - 1; k >= size; k--) {
            rtn = rtn + cards.get(k);
            if (k != size) {
                rtn = rtn + ", ";
            }
            if ((k - cards.size()) % 2 == 0) {

                rtn = rtn + "\n";
            }
        }

        rtn = rtn + "\n";
        return rtn;
    }
  
  
  
}