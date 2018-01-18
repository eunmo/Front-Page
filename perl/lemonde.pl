use LWP::Simple;
use feature 'unicode_strings';
use utf8;
use Encode;
use Mojo::DOM;
use Mojo::Collection;
use DateTime;
binmode(STDOUT, ":utf8");

my $date = $ARGV[0];
$date =~ /^(.{4})(.{2})(.{2})/;
my $datetime = DateTime->new( year => $1, month => $2, day => $3 )
											 ->subtract( days => 1);
$date = $datetime->ymd('/');

my $url = "http://www.lemonde.fr/editoriaux";
my $html = get("$url");
my $dom = Mojo::DOM->new($html);

my $json = "[";
my $count = 0;

for my $article ($dom->find('article')->each) {
	my $h3 = $article->find('h3')->first;
	next if $h3->attr('class') =~ "marqueur_restreint";

	my $a = $article->find('a')->first;
	my $href = $a->attr('href');
	my $title = $a->text;
	next unless $href =~ $date;

	$json .= "," if $count++;
	$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
}

if ($count == 0) {
	$url = "http://www.lemonde.fr/idees/1.html";
	$html = get("$url");
	$dom = Mojo::DOM->new($html);

	for my $article ($dom->find('article')->each) {
		my $span = $article->find('span[class="nature_edito"]')->first;
		next unless $span->text =~ 'Editorial';

		my $a = $article->find('a')->first;
		my $href = $a->attr('href');
		my $title = $a->text;
		next unless $href =~ $date;

		$json .= "," if $count++;
		$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
	}
}

$json .= "]";
print $json;
