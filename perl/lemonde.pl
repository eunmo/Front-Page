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

for my $article ($dom->find('section[class*="teaser"]')->each) {
	my $h3 = $article->find('h3')->first;
	next if $h3->attr('class') =~ "marqueur_restreint";

	my $a = $article->find('a')->first;
	my $href = trimLink($a->attr('href'));
	my $title = trim($a->text);
	next unless $href =~ $date;

	my $text = trim($article->find('p')->first->text);
	next unless $text =~ /^Editorial/;


	$json .= "," if $count++;
	$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
}

my $index = 1;
while ($count == 0 && $index < 3) {
	searchFallback($index++);
}

$json .= "]";
print $json;

sub trim($)
{
	my $text = shift;
	$text =~ s/^\s+|\s+$//g;
	return $text;
}

sub searchFallback($)
{
	my $index = shift;
	$url = "http://www.lemonde.fr/idees/$index.html";
	$html = get("$url");
	$dom = Mojo::DOM->new($html);

	for my $article ($dom->find('article')->each) {
		my $spans = $article->find('span[class="nature_edito"]');
		next unless $spans->size > 0 && $spans->first->text =~ 'Editorial';


		my $a = $article->find('a')->first;
		my $href = trimLink($a->attr('href'));
		my $title = trim($a->text);
		next unless $href =~ $date;

		$json .= "," if $count++;
		$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
	}
}

sub trimLink($)
{
	my $link = shift;
	$link =~ s/^.*lemonde\.fr//;
	return $link;
}
