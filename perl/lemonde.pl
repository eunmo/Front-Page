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
print $date, "\n";

my $url = "http://www.lemonde.fr/editoriaux/";
my $html = get("$url");
my $dom = Mojo::DOM->new($html);

my $json = "[";
my $count = 0;

for my $h3 ($dom->find('article')->each) {
	my $a = $h3->find('a')->first;
	my $href = $a->attr('href');
	my $title = $a->all_text;
	next unless $href =~ $date;

	$json .= "," if $count++;
	$json .= "{\"href\": \"$href\", \"title\": \"$title\"}";
}

$json .= "]";
print $json;
