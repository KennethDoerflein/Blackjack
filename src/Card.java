import java.net.URL;
import java.util.Objects;

// Doerflein 2022
public class Card {

	private String suit;
	private String rank;
	private int pointValue;
	private String image;


 
	public Card(String cardRank, String cardSuit, int cardPointValue, String imageName) {
		
		rank = cardRank;
		suit = cardSuit;
		pointValue = cardPointValue;
		image = imageName;
	}

	public String suit() {
		return suit;
	}

	public String rank() {
		return rank;
	}
	public String getImage() {
		return image;
	}

	public int pointValue() {
		return pointValue;
	}

	public URL imagePath(){
		return Objects.requireNonNull(Blackjack_Cards.class.getResource("/assets/cards/" + image));
	}


	@Override
	public String toString() {
	    if (rank.equals("ace")){
	        return rank + " of " + suit + " (point value = 1 or 11)";
	       }
		return rank + " of " + suit + " (point value = " + pointValue + ")";
	}
}
